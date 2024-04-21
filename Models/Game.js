import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
                                        players: [{player_id: {type: String},
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
                                          },
                                        winner: {type: String} });

export const Game = mongoose.model('Game', gameSchema, 'Games');


