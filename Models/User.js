import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({name: {
                                               type: String,
                                               lowercase: true 
                                                },

                                        avatar:{
                                               type: String
                                                },

                                        games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Game'}] });
export const User = mongoose.model('User', userSchema, 'Users');
