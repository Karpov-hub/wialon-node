import db from "@lib/db";
import FileProvider from "@lib/fileprovider";


// Run every min
//const time = "* * * * *";

// Run every night 1.01
const time = "1 1 * * *";
const description = "Delete Files";

async function run() {
  //Delete usagereport and invoice files  
    try {
      const files = await db.provider.findAll({
        attributes:['code'],
        where :{      
          filename: {
            [db.Sequelize.Op.in]: ['usagereport.xlsx', 'invoice.xlsx']
          }
        }
      });
    
      for (let i = 0; i < files.length; i++) {
        try {   
          await FileProvider.del(files[i].dataValues);
        } catch (e) {
        } finally {
          await db.provider.destroy({
            where: {
                code : files[i].dataValues.code
              }
          });  
        }   
    }
  } catch (err) {
    console.log("@@Delete File err = ", err);
  }
}


export default {
  time,
  description,
  run
};
