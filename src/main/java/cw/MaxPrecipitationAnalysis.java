package cw;

import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.GenericOptionsParser;


public class MaxPrecipitationAnalysis {

    // ----------------- Mapper -----------------
    public static class PrecipMapper extends Mapper<LongWritable, Text, Text, DoubleWritable> {

        private Text outKey = new Text();
        private DoubleWritable outVal = new DoubleWritable();

        @Override
        protected void map(LongWritable key, Text value, Context context)
                throws IOException, InterruptedException {

            String line = value.toString();
            String lower = line.toLowerCase();

            // Skip header
            if (lower.startsWith("location_id")) {
                return;
            }

            String[] fields = line.split(",", -1);
            if (fields.length <= 13) {
                return; // Not enough columns
            }

            String dateStr = fields[1].trim();        // date column
            String precipHoursStr = fields[13].trim(); // precipitation_hours (h)

            // Parse date to extract year and month
            int[] yearMonth = parseYearMonth(dateStr);
            if (yearMonth == null) {
                return; // Invalid date
            }

            int year = yearMonth[0];
            int month = yearMonth[1];

            // Parse precipitation hours
            double precipHours;
            try {
                precipHours = precipHoursStr.isEmpty() ? 0.0 : Double.parseDouble(precipHoursStr);
            } catch (NumberFormatException e) {
                return; // Invalid number
            }

            // Validate precipitation (should not be negative)
            if (precipHours < 0) {
                return;
            }

            // Emit: (year,month) -> precipitation_hours
            String yearMonthKey = year + "," + String.format("%02d", month);
            outKey.set(yearMonthKey);
            outVal.set(precipHours);
            context.write(outKey, outVal);
        }

        /**
         * Parse date in MM/DD/YYYY or DD/MM/YYYY format.
         * Returns {year, month} or null if invalid.
         */
        private int[] parseYearMonth(String rawDate) {
            try {
                String[] parts = rawDate.split("/", -1);
                if (parts.length != 3) {
                    return null;
                }

                int p1 = Integer.parseInt(parts[0].trim());
                int p2 = Integer.parseInt(parts[1].trim());
                int year = Integer.parseInt(parts[2].trim());

                int month;

                // Determine date format
                if (p1 > 12) {
                    // p1 is day (13-31), so format is DD/MM/YYYY
                    month = p2;
                } else if (p2 > 12) {
                    // p2 is day (13-31), so format is MM/DD/YYYY
                    month = p1;
                } else {
                    // Ambiguous (both <= 12), assume DD/MM/YYYY
                    month = p2;
                }

                if (month < 1 || month > 12) {
                    return null;
                }

                return new int[]{year, month};

            } catch (Exception e) {
                return null;
            }
        }
    }

    // ----------------- COMBINER -----------------
    public static class PrecipCombiner extends Reducer<Text, DoubleWritable, Text, DoubleWritable> {

        @Override
        protected void reduce(Text key, Iterable<DoubleWritable> values, Context context)
                throws IOException, InterruptedException {

            double sum = 0.0;
            for (DoubleWritable val : values) {
                sum += val.get();
            }

            context.write(key, new DoubleWritable(sum));
        }
    }

    /// ----------------- Reducer -----------------
    public static class MaxPrecipReducer extends Reducer<Text, DoubleWritable, Text, NullWritable> {

        private double globalMaxPrecip = Double.NEGATIVE_INFINITY;
        private String maxYearMonth = "";

        @Override
        protected void reduce(Text key, Iterable<DoubleWritable> values, Context context)
                throws IOException, InterruptedException {

            // Sum precipitation for this year-month
            double totalPrecip = 0.0;
            for (DoubleWritable val : values) {
                totalPrecip += val.get();
            }

            // Track global maximum
            if (totalPrecip > globalMaxPrecip) {
                globalMaxPrecip = totalPrecip;
                maxYearMonth = key.toString();
            }
        }

        @Override
        protected void cleanup(Context context) throws IOException, InterruptedException {
            // Output only the maximum month/year
            if (!maxYearMonth.isEmpty() && globalMaxPrecip != Double.NEGATIVE_INFINITY) {

                // Parse year and month for formatted output
                String[] parts = maxYearMonth.split(",");
                if (parts.length == 2) {
                    String year = parts[0];
                    String monthNum = parts[1];
                    String monthName = getMonthName(monthNum);

                    // Create human-readable output
                    String output = monthName + " " + year + " had the highest total precipitation of "
                                  + String.format("%.1f", globalMaxPrecip) + " hours";

                    context.write(new Text(output), NullWritable.get());
                } else {
                    // Fallback if parsing fails
                    context.write(new Text(maxYearMonth), NullWritable.get());
                }
            }
        }

        //Convert month number to month name
        private String getMonthName(String monthNum) {
            String[] months = {
                "", "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            };

            try {
                int m = Integer.parseInt(monthNum);
                if (m >= 1 && m <= 12) {
                    return months[m];
                }
            } catch (NumberFormatException e) {
                // Fall through
            }

            return monthNum + "th month"; // Fallback
        }
    }

    // ==================== MAIN ====================
    public static void main(String[] args) throws Exception {

        Configuration conf = new Configuration();
        String[] otherArgs = new GenericOptionsParser(conf, args).getRemainingArgs();

        if (otherArgs.length != 2) {
            System.err.println("Usage: MaxPrecipitationAnalysis <weatherInput> <output>");
            System.err.println("  weatherInput: Path to weatherData.csv");
            System.err.println("  output: Output directory for results");
            System.exit(2);
        }

        Job job = Job.getInstance(conf, "Max Precipitation Month-Year (Full Dataset)");
        job.setJarByClass(MaxPrecipitationAnalysis.class);

        // Set Mapper, Combiner, and Reducer
        job.setMapperClass(PrecipMapper.class);
        job.setCombinerClass(PrecipCombiner.class);
        job.setReducerClass(MaxPrecipReducer.class);

        // 1 reducer to find global maximum
        job.setNumReduceTasks(1);

        // Set output types
        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(DoubleWritable.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(NullWritable.class);

        // Set input and output paths
        FileInputFormat.addInputPath(job, new Path(otherArgs[0]));
        FileOutputFormat.setOutputPath(job, new Path(otherArgs[1]));

        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
