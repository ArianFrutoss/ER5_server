import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
                                        players: [{id: {type: String},
                                                    meleeHits: {
                                                        type: Number
                                                    },
                                                    rangedHits: {
                                                        type: Number
                                                    },
                                                    damageDone: {
                                                        type: Number
                                                    },
                                                    damageReceived: {
                                                        type: Number
                                                    }}], 

                                        date: {
                                            type: Date, default: Date.now
                                          } });

export const Game = mongoose.model('Game', gameSchema, 'Games');


