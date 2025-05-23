import mongoose from 'mongoose';

const cajaSchema = new mongoose.Schema({
  cajaId: {
    type: Number,
    unique: true
  },
  monto: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0, 'El monto no puede ser negativo']
  },
  referencia: {
    type: String,
    required: [true, 'La referencia es requerida'],
    maxlength: [50, 'La referencia no puede exceder 50 caracteres']
  },
  motivo: {
    type: String,
    required: [true, 'El motivo es requerido'],
    enum: {
      values: ['Cobro Pedido', 'Pago de proveedor'],
      message: 'Motivo no válido'
    }
  },
  fechaHora: {
    type: Date,
    default: Date.now
  },
  producto: {
    type: String,
    required: [true, 'El producto es requerido'],
    maxlength: [100, 'El nombre del producto no puede exceder 100 caracteres']
  },
  nombreProveedorCliente: {
    type: String,
    required: [true, 'El nombre del cliente/proveedor es requerido'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  }
});

const usuarioSchema = new mongoose.Schema({
  usuarioId: {
    type: Number,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{4}$/.test(v.toString());
      },
      message: props => `${props.value} no es un ID válido. Debe ser un número de 4 dígitos`
    }
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  contraseña: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    validate: {
      validator: function (v) {
        return v.toString().length <= 8;
      },
      message: 'La contraseña no puede exceder los 8 caracteres'
    }
  },
  rol: {
    type: String,
    required: [true, 'El rol es requerido'],
    enum: {
      values: ['Gerente', 'Empleado', 'Repartidor'],
      message: 'Rol no válido. Valores permitidos: Gerente, Empleado, Repartidor'
    }
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un correo válido'
    ]
  },
  caja: [cajaSchema]
}, {
  collection: 'usuarios',
  timestamps: true
});

const generarIdUnico = async (campo) => {
  let id;
  let contador = 0;
  let existe;

  do {
    id = Math.floor(1000 + Math.random() * 9000);
    contador++;

    if (contador > 100) {
      throw new Error('No se pudo generar un ID único después de 100 intentos');
    }

    existe = await mongoose.model('Usuario').exists({ [campo]: id });
  } while (existe);

  return id;
};

usuarioSchema.pre('save', async function (next) {
  try {
    if (!this.usuarioId) {
      this.usuarioId = await generarIdUnico('usuarioId');
    }

    for (const movimiento of this.caja) {
      if (!movimiento.cajaId) {
        movimiento.cajaId = await generarIdUnico('caja.cajaId');
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

usuarioSchema.methods.toJSON = function () {
  const usuario = this.toObject();
  delete usuario.contraseña;
  return usuario;
};

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;
