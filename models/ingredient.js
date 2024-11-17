const mongoose = require('mongoose')
const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // will add createdAt and updatedAt
  }
)

const Ingredient = mongoose.model('Ingredient', ingredientSchema)

module.exports = Ingredient
