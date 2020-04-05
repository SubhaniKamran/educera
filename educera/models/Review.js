const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title"],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, "Please add a course Description"]
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add rating"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bootcamp",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});
//prevent user from adding more then one review per bootcamp
ReviewSchema.index({ user: 1, bootcamp: 1 }, { unique: true });

//statics method to get the avg rating of bootcamp
ReviewSchema.statics.getAvgRating = async function(bootcampid) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampid } },
    {
      $group: {
        id: "$bootcamp",
        avgRating: { $avg: "$rating" }
      }
    }
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampid, {
      averageCost: obj[0].avgRating
    });
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.pre("remove", function() {
  this.constructor.getAvgRating(this.bootcamp);
});
ReviewSchema.post("save", function() {
  this.constructor.getAvgRating(this.bootcamp);
});
module.exports = mongoose.model("Review", ReviewSchema);
