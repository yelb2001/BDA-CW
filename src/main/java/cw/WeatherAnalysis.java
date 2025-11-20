package cw;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.GenericOptionsParser;



public class WeatherAnalysis {

    // ----------------- Mapper -----------------
    // Map-side join + monthly aggregation
    public static class WeatherMapper extends Mapper<LongWritable, Text, Text, Text> {

        private Map<String, String> locationMap = new HashMap<>();
        private Text outKey = new Text();
        private Text outVal = new Text();

        @Override
        protected void setup(Context context) throws IOException {
            // Read locations.csv from Distributed Cache
            URI[] cacheFiles = context.getCacheFiles();
            if (cacheFiles == null || cacheFiles.length == 0) {
                throw new IOException("Location file not set in DistributedCache");
            }

            // We assume the first cache file is locations.csv
            Path locationPath = new Path(cacheFiles[0].toString());
            FileSystem fs = FileSystem.get(context.getConfiguration());

            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(fs.open(locationPath)))) {

                String line;
                while ((line = br.readLine()) != null) {
                    String lower = line.toLowerCase();
                    if (lower.startsWith("location_id")) {
                        // skip header
                        continue;
                    }

                    String[] a = line.split(",", -1);
                    if (a.length <= 7) continue; // safety check

                    String locationId = a[0].trim();
                    String city       = a[7].trim();

                    if (!locationId.isEmpty() && !city.isEmpty()) {
                        locationMap.put(locationId, city);
                    }
                }
            }
        }

        @Override
        protected void map(LongWritable key, Text value, Context context)throws IOException, InterruptedException {

            String line = value.toString();
            String lower = line.toLowerCase();
            if (lower.startsWith("location_id")) {
                // skip header in weather file too
                return;
            }

            String[] a = line.split(",", -1);
            if (a.length <= 13) {
                // not enough columns, skip
                return;
            }

            String locationId = a[0].trim();
            String date       = a[1].trim(); // MM/DD/YYYY
            String tempMean   = a[5].trim(); // temperature_2m_mean
            String precipH    = a[13].trim(); // precipitation_hours

            // JOIN in mapper: lookup city
            String city = locationMap.get(locationId);
            if (city == null || city.isEmpty()) {
                // no matching location → skip (inner join)
                return;
            }

            //
            // formatting and adding date condition 
            //

            String[] dateParts = date.split("/" , -1);
            if (dateParts.length != 3 ) {
                return;
            }

            // mm/dd/yyyy
            String monthStr = dateParts[0].trim();
            String yearStr  = dateParts[2].trim();

            int monthInt, year;
            try {
                monthInt = Integer.parseInt(monthStr);
                year  = Integer.parseInt(yearStr);
            } catch (NumberFormatException e) {
                return;
            }

            // build the record date
            int currentYear = java.time.LocalDate.now().getYear();
            int minYear = currentYear - 9; 

            if (year < minYear){
                return;
            }

            // chamge month to 2 digits: "1" -> "01"
            String month = String.format("%02d", monthInt);

            //String monthName = monthToName(month); 


            double precip = precipH.isEmpty() ? 0.0 : Double.parseDouble(precipH);
            double temp   = tempMean.isEmpty() ? 0.0 : Double.parseDouble(tempMean);

            // Key: (city, year, month)
            String outK = city + "," + year + "," + month;

            // Value: partial sums (precip, temp, count=1)
            String outV = precip + "," + temp + ",1";

            outKey.set(outK);
            outVal.set(outV);
            context.write(outKey, outVal);
        }
    }

    // ----------------- Reducer -----------------
    public static class MonthlyReducer extends Reducer<Text, Text, Text, Text> {

        private Text outVal = new Text();

        @Override
        protected void reduce(Text key, Iterable<Text> values, Context context)
                throws IOException, InterruptedException {

            double sumPrecip = 0.0;
            double sumTemp   = 0.0;
            long count       = 0L;

            for (Text t : values) {
                String[] a = t.toString().split(",", -1);
                if (a.length < 3) continue;

                double p = a[0].isEmpty() ? 0.0 : Double.parseDouble(a[0]);
                double tm = a[1].isEmpty() ? 0.0 : Double.parseDouble(a[1]);
                long c = a[2].isEmpty() ? 0L : Long.parseLong(a[2]);

                sumPrecip += p;
                sumTemp   += tm;
                count     += c;
            }

            double avgTemp = (count == 0) ? 0.0 : (sumTemp / count);

            // Output: totalPrecip, avgTemp
            outVal.set(sumPrecip + "," + avgTemp);
            context.write(key, outVal);
        }
    }

    // ----------------- main -----------------
    public static void main(String[] args) throws Exception {

        Configuration conf = new Configuration();
        String[] otherArgs = new GenericOptionsParser(conf, args).getRemainingArgs();

        if (otherArgs.length != 3) {
            System.err.println("Usage: WeatherMonthlyMapSideJoin <locationFile> <weatherInput> <output>");
            System.exit(2);
        }

        Job job = Job.getInstance(conf, "Weather Monthly Map-Side Join");
        job.setJarByClass(WeatherMapper.class);

        // 1) Add the small locations file to Distributed Cache
        job.addCacheFile(new Path(otherArgs[0]).toUri());

        // 2) Set mapper & reducer
        job.setMapperClass(WeatherMapper.class);
        job.setReducerClass(MonthlyReducer.class);

        // 3) Set key/value types
        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(Text.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(Text.class);

        // 4) Input and output paths
        FileInputFormat.addInputPath(job, new Path(otherArgs[1]));   // weather input
        FileOutputFormat.setOutputPath(job, new Path(otherArgs[2])); // output dir

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
