import uuidGenerator from "uuid";
import db from "@lib/db";

async function insertLogs(data, realmId, userId){
    if (!data.data) {
        data.data = {};
    }
    await db.logs_for_api.create({
        id: uuidGenerator.v4(),
        action: data.action,
        user_id: data.user_id,
        message: data.message,
        data: JSON.stringify(data.data),
        ctime: new Date(),
        mtime: new Date(),
        removed: 0,
        maker: null
    });

    return { success: true }
}

export default {
    insertLogs
}