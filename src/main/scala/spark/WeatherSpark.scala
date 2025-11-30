package spark;

import org.apache.spark.sql.{SaveMode, SparkSession}
import org.apache.spark.sql.functions._

object WeatherSpark{
    def main(args: Array[String]):Unit = {

        val spark = SparkSession.builder()
            .appName("WeatherSpark")
            .master("local[*]")
            .getOrCreate()


        import spark.implicits._

        //read CSV as dataframe
        val weatherRaw = spark.read
            .option("header", "true")
            .option("inferSchema", "true")
            .csv("hdfs://namenode:9000/data/weather/weatherData.csv")


        //taking only the columns needed
        val weatherCropped = weatherRaw.select(
            col("date").cast("date").as("w_date"), 
            col("shortwave_radiation_sum_MJ_m2").as("shortwave_mj")                                      
        )


        weatherCropped.write
            .mode(SaveMode.Overwrite)
            .parquet("hdfs://namenode:9000/data/weather_parquet")


        spark.stop()

    }

}
