import db, { Sequelize } from "@lib/db";
import Queue from "@lib/queue";
import { CONSTANTS } from "@lib/utils";
import FileProvider from "@lib/fileprovider";

const Op = Sequelize.Op;

async function createTicket(data, realmId, userId) {
  let filesID = [];
  let filesName = [];
  let filesSize = [];
  if (data.files) {
    for (const file of data.files) {
      filesID.push(file.code);
      filesName.push(file.name);
      filesSize.push(file.size);
    }
  }
  let cTickets = await db.ticket.findAll({
    where: { user_id: userId, realm_id: realmId }
  });

  let ticket = {
    title: data.title,
    category: data.category,
    message: data.message,
    file_id: filesID,
    file_name: filesName,
    file_size: filesSize,
    user_id: userId,
    realm_id: realmId,
    number_of_ticket: "NT" + (cTickets.length + 1),
    type: 0,
    is_user_message: data.is_user_message
  };
  let ticketId = await db.ticket.create(ticket);
  ticket.ticket_id = ticketId.id;
  ticket.files = data.files;
  await createComment(ticket, realmId, userId);

  Queue.broadcastJob("call-admin", {
    model: "Crm.modules.support.model.SupportModel",
    method: "onChange",
    data: {}
  });

  const user = await db.user
    .findOne({
      where: { id: userId, realm: realmId },
      raw: true,
      attributes: ["id", "email"],
      include: [{ model: db.organization, attributes: ["organization_name"] }]
    })
    .catch((e) => {
      console.log(
        "support-service, error on getting data from user error: ",
        e
      );
      throw "SEARCHINGERROR";
    });

  data.code = "new_ticket_notification";
  data.to = user.email;

  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: data.lang,
      code: data.code,
      to: data.to,
      body: data
    },
    realmId: realmId
  }).catch((e) => {
    console.log("support-service, error on Queue.newJob, error: ", e);
    throw "MAILSENDINGERROR";
  });

  data.to = CONSTANTS.REPORT_REQ_EMAIL_TO;
  data.cc = CONSTANTS.REPORT_REQ_EMAIL_CC;
  data.code = "notify-supervisor-about-new-ticket";
  data.lang = data.lang;
  data.user_id = user.id;
  data.user_email = user.email;
  data.attachments = [];
  data.organization_name = user["organization.organization_name"];

  if (data.files && data.files.length) {
    const file = await FileProvider.pull({ code: data.files[0].code });
    data.attachments.push({
      filename: file.name,
      path: file.data
    });
  }

  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: data.lang,
      code: data.code,
      to: data.to,
      body: data,
      cc: data.cc,
      attachments: data.attachments
    },
    realmId: realmId
  }).catch((e) => {
    console.log("support-service, error on Queue.newJob, error: ", e);
    throw "MAILSENDINGERROR";
  });

  return {
    success: true,
    ticket
  };
}

async function createComment(data, realmId, userId) {
  const ticket = await db.ticket.findOne({
    where: {
      id: data.ticket_id
    },
    raw: true
  });

  if (!ticket) {
    if (data.is_user_message) {
      throw "TICKETNOTFOUND";
    } else {
      return {
        success: false,
        message: "Ticket not found. Cannot add new messages."
      };
    }
  } else if (ticket && ticket.status > 0) {
    if (data.is_user_message) {
      throw "TICKETHASBEENCLOSED";
    } else {
      return {
        success: false,
        message: "Ticket has been resolved or closed. Cannot add new messages."
      };
    }
  }

  let filesID = [];
  let filesName = [];
  let filesSize = [];
  if (data.files) {
    for (const file of data.files) {
      filesID.push(file.code);
      filesSize.push(file.size);
      filesName.push(file.name);
    }
  }

  let comment = {
    ticket_id: data.ticket_id,
    sender: userId,
    receiver: null,
    message: data.message,
    file_id: filesID,
    file_name: filesName,
    file_size: filesSize,
    realm_id: realmId,
    is_user_message: data.is_user_message
  };
  const commentResult = await db.comment.create(comment);

  const { sender, ...wsOut } = commentResult.dataValues;

  const ticketUserId = await db.ticket.findOne({
    where: {
      id: comment.ticket_id
    },
    raw: true,
    attributes: ["user_id"]
  });

  await db.ticket.update(
    { last_comment_date: new Date() },
    {
      where: {
        id: comment.ticket_id
      }
    }
  );
  if (!data.is_user_message) {
    const user = await db.user
      .findOne({
        where: { id: ticketUserId.user_id },
        raw: true,
        parameters: ["id", "email", "preferred_language"]
      })
      .catch((e) => {
        console.log(
          "support-service, error on getting data from user error: ",
          e
        );
        throw "SEARCHINGERROR";
      });

    data.code = "admin_ticket_answer_notification";
    data.to = user.email;
    data.ticket_number = ticket.number_of_ticket;

    Queue.newJob("mail-service", {
      method: "send",
      data: {
        lang: data.lang,
        code: data.code,
        to: data.to,
        body: data,
        preferred_language: user.preferred_language
      },
      realmId: realmId
    }).catch((e) => {
      console.log("support-service, error on Queue.newJob, error: ", e);
      throw "MAILSENDINGERROR";
    });
  }

  await Queue.broadcastJob("runOnClient", {
    method: "getComments",
    realmId,
    userId: ticketUserId.user_id,
    data: wsOut
  });

  Queue.broadcastJob("call-admin", {
    model: "Crm.modules.support.model.CommentModel",
    method: "onChange",
    data: {}
  });

  return {
    success: true,
    comment
  };
}

async function getTickets(data, realmId, userId) {
  const { start: offset, limit } = data;
  const sequelize = db.Sequelize;
  let filters = {
    user_id: userId,
    realm_id: realmId
  };

  if (data.search_ticket) {
    filters.title = sequelize.where(
      sequelize.fn("LOWER", sequelize.col("title")),
      "LIKE",
      "%" + data.search_ticket + "%"
    );
  }

  let { count, rows } = await db.ticket.findAndCountAll({
    where: filters,
    offset,
    limit,
    order: [["ctime", "DESC"]],
    raw: true
  });

  const ticketsIds = rows.map((ticket) => ticket.id);

  const comments = await db.comment.findAll({
    attributes: ["id", "ticket_id", "ctime", "is_new", "is_user_message"],
    where: {
      ticket_id: ticketsIds
    },
    raw: true
  });

  let newAdminCommentIds = comments
    .filter((comment) => !comment.is_user_message && comment.is_new)
    .map((comment) => comment.ticket_id);

  newAdminCommentIds = [...new Set(newAdminCommentIds)];

  rows = rows.map((ticket) => ({
    ...ticket,
    is_has_new_messages: newAdminCommentIds.includes(ticket.id),
    last_comment_date: !!ticket.last_comment_date
      ? ticket.last_comment_date
      : ticket.ctime
  }));

  rows.sort((ticket, ticketNext) => {
    return String(ticketNext.last_comment_date).localeCompare(
      String(ticket.last_comment_date)
    );
  });

  if (rows == null) throw "NOTICKETS";

  return {
    success: true,
    count,
    tickets: rows,
    offset,
    limit
  };
}

async function getComments(data, realmId, userId) {
  const { start: offset, limit } = data;
  const { count, rows } = await db.comment.findAndCountAll({
    where: {
      realm_id: realmId,
      ticket_id: data.ticketId
    },
    offset,
    limit,
    include: [
      {
        model: db.ticket,
        attributes: ["number_of_ticket", "title"]
      }
    ],
    order: [["ctime", "ASC"]]
  });

  return {
    success: true,
    comments: rows,
    count,
    offset,
    limit
  };
}

async function reopenTicket(data, realmId, userId) {
  const res = await db.ticket.update(
    { status: 0 },
    {
      where: { id: data.ticket_id, realm_id: realmId }
    }
  );
  if (res) return { success: true };
}

async function getCountOfNewComments(data, realmId, userId) {
  const ticketsIds = await _getIdsUserTickets(userId);

  const count = await db.comment.count({
    raw: true,
    where: {
      removed: 0,
      is_new: true,
      is_user_message: false,
      ticket_id: ticketsIds
    }
  });

  return { success: true, count };
}

async function readNewComments(data, realmId, userId) {
  const ticketsIds = await _getIdsUserTickets(userId);

  const countUpdated = await db.comment.update(
    {
      is_new: false
    },
    {
      where: {
        id: data.ids,
        removed: 0,
        ticket_id: ticketsIds,
        is_new: true
      }
    }
  );

  return { success: true, countUpdated: countUpdated[0] };
}

async function resolveTicket(data, realmId, userId) {
  const ticket = await db.ticket.findOne({
    attributes: ["id", "status"],
    where: {
      id: data.id,
      user_id: userId
    }
  });

  if (!ticket) {
    throw "TICKETNOTFOUND";
  }

  if (ticket.status != 0) {
    throw "TICKETALREADYCLOSEDORRESOLVED";
  }

  ticket.status = 1;
  await ticket.save();

  return { success: true, id: ticket.id, status: ticket.status };
}

// private method, can be called only from the backend or admin
async function closeInactiveTickets() {
  const oneWeekAgo = new Date(new Date() - 604800000); // 7 * 24 * 60 * 60 * 1000 = 604800000 (milliseconds in week)

  const tickets = await db.ticket.update(
    { status: 2 },
    {
      where: {
        last_comment_date: {
          [Op.lte]: oneWeekAgo
        },
        status: 0,
        removed: 0
      }
    }
  );
  return {
    success: true,
    count: !!tickets && tickets[0] > -1 ? tickets[0] : null
  };
}

async function _getIdsUserTickets(userId) {
  const tickets = await db.ticket.findAll({
    where: {
      user_id: userId,
      removed: 0
    },
    attributes: ["id"],
    raw: true
  });
  const ticketsIds = tickets.map((el) => el.id);

  return ticketsIds;
}

export default {
  createTicket,
  createComment,
  getComments,
  getCountOfNewComments,
  getTickets,
  reopenTicket,
  readNewComments,
  resolveTicket,
  closeInactiveTickets
};
