package spark

import org.apache.spark.sql.SparkSession

object WeatherSparkAnalysis {
  def main(args: Array[String]): Unit = {

    val spark = SparkSession.builder()
      .appName("WeatherAnalysis")
      .master("local[*]")
      .getOrCreate()

    // taking the parquet data 
    val weatherParquet = spark.read.parquet("hdfs://namenode:9000/data/weather_parquet")
    weatherParquet.createOrReplaceTempView("weather_parquet")

    // question 1
    val q1 = spark.sql(
      """
      WITH base AS (
        SELECT
          w_date,
          shortwave_mj,
          date_format(w_date, 'yyyy-MM') AS year_month
        FROM weather_parquet
      ),
      agg AS (
        SELECT
          year_month,
          SUM(shortwave_mj) AS total_sw,
          SUM(CASE WHEN shortwave_mj > 15 THEN shortwave_mj ELSE 0 END) AS high_sw
        FROM base
        GROUP BY year_month
      )
      SELECT
        year_month,
        high_sw,
        total_sw,
        100.0 * high_sw / total_sw AS pct_sw_gt_15
      FROM agg
      ORDER BY year_month
      """
    )

    println("Q1: Percentage of total shortwave radiation > 15 MJ/m² per month:")
    q1.show(100, truncate = false)

    spark.stop()
  }
}
