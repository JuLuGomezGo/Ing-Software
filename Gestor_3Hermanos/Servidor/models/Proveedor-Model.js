import mongoose from "mongoose";

const generarIdUnico = async (modelName, campoId) => {
    let id;
    let contador = 0;
    let existe;

    do {
        id = Math.floor(1000 + Math.random() * 9000);
        contador++;

        if (contador > 100) {
            throw new Error('No se pudo generar un ID único después de 100 intentos');
        }

        const Model = mongoose.model(modelName);
        existe = await Model.exists({ [campoId]: id });  // Sin declaración

    } while (existe);  // Ahora está accesible

    return id;
};


const proveedorSchema = new mongoose.Schema({
    proveedorId: {
        type: Number,
        unique: true,
        validate: (v) => /^\d{4}$/.test(v.toString())
    },
    nombre: { type: String, required: true, index: true },
    contacto: { type: String, required: true },
    email: {
        type: String, required: true,
        unique: true,
        match: [/.+@.+\..+/, "Email inválido"]
    },
    direccion: { type: String, required: true },
    activo: { type: Boolean, default: true }
}, {
    timestamps: true,
    collection: "proveedores"
});

proveedorSchema.pre('save', async function (next) {
    if (!this.proveedorId) {
        this.proveedorId = await generarIdUnico('Proveedor', 'proveedorId');
    }
    next();
});

const proveedor = mongoose.model('Proveedor', proveedorSchema);

export default proveedor;