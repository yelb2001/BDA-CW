package cw;

import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class MaxPrecipMonthYear {

    // Mapper: read each line from WeatherAnalysis job output
    // Example input line: Gampaha,2019,02\t30.0,25.0
    public static class MaxMapper extends Mapper<LongWritable, Text, Text, DoubleWritable> {

        private Text outKey = new Text();
        private DoubleWritable outVal = new DoubleWritable();

        @Override
        protected void map(LongWritable key, Text value, Context context)
                throws IOException, InterruptedException {

            String line = value.toString().trim();
            if (line.isEmpty()) return;

            // Split key and value on tab
            String[] kv = line.split("\\t");
            if (kv.length != 2) return;

            // left side: district,year,month
            String[] keyParts = kv[0].split(",");
            if (keyParts.length != 3) return;

            String year  = keyParts[1].trim();
            String month = keyParts[2].trim();

            // right side: totalPrecip,avgTemp
            String[] valParts = kv[1].split(",");
            if (valParts.length < 1) return;

            double totalPrecip;
            try {
                totalPrecip = Double.parseDouble(valParts[0].trim());
            } catch (NumberFormatException e) {
                return;
            }

            // setting mapper output
            String yearMonth = year + "," + month;
            outKey.set(yearMonth);
            outVal.set(totalPrecip);
            context.write(outKey, outVal);
        }
    }

    // Reducer: sum precipitation for each year,month and find the max
    public static class MaxReducer extends Reducer<Text, DoubleWritable, Text, DoubleWritable> {

        private double globalMax = Double.NEGATIVE_INFINITY;
        private String maxYearMonth = "";

        @Override
        protected void reduce(Text key, Iterable<DoubleWritable> values, Context context)
                throws IOException, InterruptedException {

            double sum = 0.0;
            for (DoubleWritable v : values) {
                sum += v.get();
            }

            // Track global max
            if (sum > globalMax) {
                globalMax = sum;
                maxYearMonth = key.toString(); // "2019,02"
            }
        }

        @Override
        protected void cleanup(Context context)
                throws IOException, InterruptedException {
            if (!maxYearMonth.isEmpty()) {
                context.write(new Text(maxYearMonth), new DoubleWritable(globalMax));
            }
        }
    }

    public static void main(String[] args) throws Exception {

        if (args.length != 2) {
            System.err.println("Usage: MaxPrecipMonthYear <input_from_job1> <output>");
            System.exit(2);
        }

        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "Max Precipitation Month Year");
        job.setJarByClass(MaxPrecipMonthYear.class);

        job.setMapperClass(MaxMapper.class);
        job.setReducerClass(MaxReducer.class);
        job.setNumReduceTasks(1);  

        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(DoubleWritable.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(DoubleWritable.class);

        FileInputFormat.addInputPath(job, new Path(args[0]));   // output path of WeatherAnalysis job
        FileOutputFormat.setOutputPath(job, new Path(args[1])); // new output dir

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
