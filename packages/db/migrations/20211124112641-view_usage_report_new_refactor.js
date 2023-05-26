'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          `CREATE OR REPLACE VIEW public.usage_reports
          AS SELECT t.organization_id AS id,
              t.organization_id,
              t.created_date AS date,
              ( SELECT pkg_sub.rates_package_id
                     FROM package_subscriptions pkg_sub
                    WHERE pkg_sub.organization_id = t.organization_id AND (t.created_date >= pkg_sub.from_date AND t.created_date <= pkg_sub.to_date OR t.created_date >= pkg_sub.from_date AND pkg_sub.to_date IS NULL)) AS rates_package_id,
              sum(
                  CASE
                      WHEN t.table_name = 'download_stats'::text THEN t.report_size
                      ELSE 0
                  END) AS bytes_sent,
              sum(
                  CASE
                      WHEN t.table_name = 'report_stats'::text THEN t.report_generation_time
                      ELSE 0::double precision
                  END) AS cpu_time_taken,
              sum(
                  CASE
                      WHEN t.table_name = 'report_stats'::text THEN t.report_size
                      ELSE 0
                  END) AS bytes_from_wialon,
              count(
                  CASE
                      WHEN t.table_name = 'download_stats'::text THEN t.no_clicks
                      ELSE NULL::integer
                  END) AS downloads_click,
              count(
                  CASE
                      WHEN t.table_name = 'report_stats'::text THEN t.no_clicks
                      ELSE NULL::integer
                  END) AS generate_reports_click,
              sum(
                  CASE
                      WHEN t.table_name = 'mobile_usage_stats'::text THEN t.report_generation_time
                      ELSE 0::double precision
                  END) AS mob_cpu_time,
              sum(
                  CASE
                      WHEN t.table_name = 'mobile_usage_stats'::text THEN t.report_size
                      ELSE 0
                  END) AS mob_bytes_sent,
              sum(
                  CASE
                      WHEN t.table_name = 'mobile_usage_stats'::text THEN t.bytes_from_wialon
                      ELSE 0::double precision
                  END) AS mob_bytes_from_wialon
             FROM ( 
                     
                    SELECT date(report_stats.ctime) AS created_date,
                      report_stats.report_size,
                      0 AS bytes_from_wialon,
                      report_stats.report_generation_time,
                      report_stats.id AS no_clicks,
                      report_stats.organization_id,
                      'report_stats'::text AS table_name
                     FROM report_stats
                    WHERE report_stats.status = 1
                     
                     UNION all
                  
                   SELECT date(download_stats.ctime) AS created_date,
                      download_stats.report_size,
                      0 AS bytes_from_wialon,
                      0 AS report_generation_time,
                      download_stats.id AS no_clicks,
                      download_stats.org_id AS organization_id,
                      'download_stats'::text AS table_name
                     FROM download_stats
                     
                     UNION all
                    
                    SELECT date(mobile_usage_stats.ctime) AS created_date,
                      mobile_usage_stats.bytes_sent AS report_size,
                      mobile_usage_stats.bytes_from_wialon,
                      mobile_usage_stats.cpu_time AS report_generation_time,
                      0 AS no_clicks,
                      mobile_usage_stats.organization_id,
                      'mobile_usage_stats'::text AS table_name
                     FROM mobile_usage_stats
                 
                   )t
                  
            GROUP BY t.created_date, t.organization_id
            ORDER BY t.created_date DESC, t.organization_id DESC;
          `,
          { transaction: t })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.sequelize.query(
          'DROP VIEW usage_reports', { transaction: t } ),
      ]);  
    })
  }
};
