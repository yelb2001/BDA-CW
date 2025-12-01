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
            .csv("hdfs://namenode:9000/user/iitgcpuser/spark/data/weatherSpark/weatherData.csv")



        val weatherDateCheck = weatherRaw
         .withColumn("date_us", to_date($"date", "MM/dd/yyyy")) // month/day/year
         .withColumn("date_eu", to_date($"date", "dd/MM/yyyy")) // day/month/year
         .withColumn(
            "w_date",
                when($"date_us".isNotNull && $"date_eu".isNull, $"date_us")      // only US works
                .when($"date_us".isNull && $"date_eu".isNotNull, $"date_eu")  // only EU works
                .when($"date_us".isNotNull && $"date_eu".isNotNull, $"date_eu")
                .otherwise(lit(null).cast("date"))
        )
        .drop("date_us", "date_eu")


        //taking only the columns needed
        val weatherCropped = weatherRaw.select(
            $"w_date",
            $"shortwave_radiation_sum_MJ_m2".as("shortwave_mj")                                    
        )

        //writing to parquet file
        weatherCropped.write
            .mode(SaveMode.Overwrite)
            .parquet("hdfs://namenode:9000/user/iitgcpuser/spark/data/weatherSpark/weather_parquet")



        spark.stop()

    }

}
