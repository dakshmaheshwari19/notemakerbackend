import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const noteSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type: String,
        required: false
    },
    description:{
        type: String
    },
    archived:{
        type: Boolean,
        default:false
    },
    starred:{
        type: Boolean,
        default:false
    },
    trashed:{
        type: Boolean,
        default:false
    }
},{timestamps:true})

noteSchema.plugin(mongooseAggregatePaginate)

export const Note = mongoose.model("Note",noteSchema)