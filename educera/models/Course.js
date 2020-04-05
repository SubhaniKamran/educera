const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"]
  },
  description: {
    type: String,
    required: [true, "Please add a course Description"]
  },
  weeks: {
    type: String,
    required: [true, "Please add weeks"]
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tution fee"]
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a skill"],
    enum: ["beginner", "intermediate", "advanced"]
  },
  scholershipAvailible: {
    type: Boolean,
    default: false
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

//statics method to get the avg cost of tution
CourseSchema.statics.getAvgCost = async function(bootcampid) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampid } },
    {
      $group: {
        id: "$bootcamp",
        avgCost: { $avg: "$tution" }
      }
    }
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampid, {
      averageCost: Math.ceil(obj[0].avgCost / 10) * 10
    });
  } catch (error) {
    console.log(error);
  }
};

CourseSchema.pre("remove", function() {
  this.constructor.getAvgCost(this.bootcamp);
});
CourseSchema.post("save", function() {
  this.constructor.getAvgCost(this.bootcamp);
});
module.exports = mongoose.model("Course", CourseSchema);
