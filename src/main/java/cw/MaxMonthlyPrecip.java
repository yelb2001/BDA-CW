// package cw;

// import java.io.BufferedReader;
// import java.io.IOException;
// import java.io.InputStreamReader;
// import java.net.URI;
// import java.util.HashMap;
// import java.util.Map;
// import org.apache.hadoop.conf.Configuration;
// import org.apache.hadoop.fs.FileSystem;
// import org.apache.hadoop.fs.Path;
// import org.apache.hadoop.io.LongWritable;
// import org.apache.hadoop.io.Text;
// import org.apache.hadoop.mapreduce.Job;
// import org.apache.hadoop.mapreduce.Mapper;
// import org.apache.hadoop.mapreduce.Reducer;
// import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
// import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
// import org.apache.hadoop.util.GenericOptionsParser;

// public class TotalPrecipitation {

//     //mapper class



    
// }

package cw;

public class MaxMonthlyPrecip {
    /* mapper
     * one data set - weather
     * columns - date / preciptation
     * out put : key - year , month / value - preciptation
     * 
     * Reducer
     * input  : key - year , month / value - preciptation
     * output : key - year , month / value - total precipitation per month
     * 
     */


    public static class MaxMonthMapper extends Mapper<...> { ... }
    public static class MaxMonthReducer extends Reducer<...> { ... }

    public static void main(String[] args) throws Exception {
        // configure Job2 here (input = weatherData.csv)
    }
}

