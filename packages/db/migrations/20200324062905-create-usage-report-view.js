'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE VIEW "usage_reports" as 
          select
          t.organization_id as id,
          t.organization_id as organization_id,
          t.created_date as date,
          (
          select
            rates_package_id
          from
            package_subscriptions pkg_sub
          where
            pkg_sub.organization_id = t.organization_id
            and ( (t.created_date between date(pkg_sub.from_date) and date(pkg_sub.to_date))
            or (t.created_date >= date(pkg_sub.from_date)
            and pkg_sub.to_date isnull) )) as rates_package_id,
          sum(case when t.table_name = 'download_stats' then t.report_size else 0 end) as bytes_sent,
          sum(case when t.table_name = 'report_stats' then t.report_generation_time else 0 end) as cpu_time_taken,
          sum(case when t.table_name = 'report_stats' then t.report_size else 0 end) as bytes_from_wialon
        from
          (
          select
            date(ctime) as created_date,
            report_size,
            0 as report_generation_time,
            org_id as organization_id,
            'download_stats' as table_name
          from
            download_stats
        union all
          select
            date(ctime) as created_date ,
            report_size,
            report_generation_time,
            organization_id,
            'report_stats' table_name
          from
            report_stats
          where
            status = 1 ) t
        group by
          t.created_date,
          t.organization_id
        order by
          t.created_date desc,
          t.organization_id desc`,
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(
        `drop view if exists usage_reports`), 
    ]);    
  }
};
