const joi = require('joi');

const productSchema = joi.object({
    id: joi.number().integer().positive().required()
        .messages({'number.base': 'El ID debe ser un numero'}),
    
    name: joi.string().min(3).max(50).required()
        .messages({'string.empty': 'El nombre no puede estar vacío'}),

    price: joi.number().precision(2).positive().required()
        .messages({'number.positive': 'El precio debe ser mayor a 0'})
    })

const idOnlySchema = joi.object({
    id: productSchema.extract('id') // Extrae la regla exacta del ID del esquema base
});   

module.exports = { productSchema, idOnlySchema };