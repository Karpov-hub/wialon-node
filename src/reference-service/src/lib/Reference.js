import db from "@lib/db";
import FileProvider from "@lib/fileprovider";

async function createReference(data, realmId, userId) {
  let filesID = [];
  let filesName = [];
  let filesSize = [];

  for (const file of data.files) {
    filesID.push(file.code);
    filesSize.push(file.size);
    filesName.push(file.name);
  }
  const alreadyExistReference = await db.references_report.findOne({
    where: {
      id: data.id
    },
    raw: true
  });
  if (alreadyExistReference && alreadyExistReference.id) {
    filesID = alreadyExistReference.file_id.concat(filesID);
    filesName = alreadyExistReference.file_name.concat(filesName);
    filesSize = alreadyExistReference.file_size.concat(filesSize);
  }
  let reference = {
    id: data.id,
    route_id: data.route_id,
    description: data.description,
    file_id: filesID,
    file_name: filesName,
    file_size: filesSize,
    files: data.files,
    realm_id: data.realm_id,
    lang: data.lang
  };
  let referenceObject = await db.references_report.upsert(reference);
  if (referenceObject == false || referenceObject == true) {
    return {
      success: true,
      data: reference
    };
  } else {
    return {
      success: false,
      message: "Unexpected error. Please, contact to Dev team."
    };
  }
}

async function getReference(data, realmId, userId) {
  if (!data.lang) {
    data.lang = "EN";
  }

  data.lang = data.lang.toUpperCase();

  const reference = await db.references_report.findOne({
    raw: true,
    where: {
      route_id: data.route_id,
      lang: data.lang,
      removed: 0
    }
  });

  if (!reference) {
    throw "NOREFERNCEFORSELECTEDREPORT";
  }

  return {
    success: true,
    reference
  };
}

async function getReferences(data, realmId, userId) {
  let { start: offset = null, limit = null } = data;
  let filters = {
    realm_id: realmId,
    removed: 0
  };
  if (data.lang) {
    filters.lang = data.lang;
    filters.lang = filters.lang.toUpperCase();
  }

  let { count, rows } = await db.references_report.findAndCountAll({
    where: filters,
    include: [{ model: db.route, attributes: ["report_name"] }],
    offset,
    limit,
    order: [["ctime", "DESC"]],
    raw: true
  });
  if (rows == null) throw "NOREFERENCES";

  const routeIds = rows.map((row) => row.route_id);
  const reportLabels = await db.report_label.findAll({
    where: {
      report_id: routeIds,
      removed: 0
    },
    attributes: ["report_id", "report_name", "lang"]
  });

  for (const reference of rows) {
    reference.report_name = reference["route.report_name"];
    delete reference["route.report_name"];
    for (const label of reportLabels) {
      if (
        reference.route_id === label.report_id &&
        reference.lang === label.lang
      ) {
        reference.report_name = label.report_name;
      }
    }
  }
  return { success: true, references: rows, count, offset, limit };
}

async function deleteFileFromReference(data, realmId, userId) {
  const recordReference = await db.references_report.findOne({
    where: {
      id: data.recordData.id,
      removed: 0
    },
    raw: true
  });
  if (recordReference.length == 0) {
    return {
      success: true,
      message:
        "Reference for delete file not found. Please, contact to Dev/Admin Team."
    };
  }
  const indexFileInArrays = recordReference.file_id.indexOf(data.file.code);
  if (indexFileInArrays == -1) {
    return {
      success: true,
      message:
        "File not found in the Reference. Please, contact to Dev/Admin Team or try once again."
    };
  }
  let changed_file_id = recordReference.file_id;
  let changed_file_name = recordReference.file_name;
  let changed_file_size = recordReference.file_size;

  changed_file_id.splice(indexFileInArrays, 1);
  changed_file_name.splice(indexFileInArrays, 1);
  changed_file_size.splice(indexFileInArrays, 1);

  await db.references_report.update(
    {
      file_id: changed_file_id,
      file_size: changed_file_size,
      file_name: changed_file_name,
      mtime: new Date()
    },
    {
      where: {
        id: data.recordData.id
      }
    }
  );
  const recordReferenceUpdated = await db.references_report.findOne({
    where: {
      id: data.recordData.id,
      removed: 0
    },
    raw: true
  });

  const deleteFile = await FileProvider.del({ code: data.file.code });
  if (deleteFile.success) {
    return {
      success: true,
      message: "File successfully deleted.",
      data: recordReferenceUpdated
    };
  } else {
    return {
      success: false,
      message:
        "File not deleted. Please, contact to Dev Team or try once again."
    };
  }
}

export default {
  createReference,
  deleteFileFromReference,
  getReferences,
  getReference
};
