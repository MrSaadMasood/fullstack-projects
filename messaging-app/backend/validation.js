// schema for different collections
const usersCollectionSchema = {
        validator : {
            $jsonSchema : {
                required : ["fullName", "email", "password"],
                properties : {
                    fullName : {
                        bsonType : "string"
                    },
                    email : {
                        bsonType : "string"
                    },
                    password : {
                        bsonType : "string"
                    },
                    friends : {
                        bsonType : "array",
                        items : {
                            bsonType : "objectId"
                        }
                    },
                    receivedRequests : {
                        bsonType : "array",
                        items : {
                            bsonType : "objectId"
                        }
                    },
                    sentRequests : {
                        bsonType : "array",
                        items : {
                            bsonType : "objectId"
                        }
                    },
                    normalChats : {
                        bsonType : "array",
                        items : {
                            bsonType : "object",
                            required : ["friendId", "collectionId"],
                            properties : {
                                friendId : {
                                    bsonType : "objectId"
                                },
                                collectionId : {
                                    bsonType : "objectId"
                                }
                            }
                        }
                    },
                    groupChats : {
                        bsonType : "array",
                        items : {
                        bsonType : "object",
                        required : ["id","members", "admins", "collectionId" ],
                        properties : {
                            id : {
                                bsonType : "objectId"
                            },
                            members : {
                                bsonType : "array",
                                items : {
                                    bsonType : "objectId"
                                }
                            },
                            admins : {
                                bsonType : "array",
                                items : {
                                    bsonType : "objectId"
                                }
                            },
                            collectionId : {
                                bsonType : "objectId"
                            }
                        } 

                        }

                    
                    },
                    profilePicture : {
                        bsonType : "string"
                    },
                    bio : {
                        bsonType : "string"
                    }

                }
            }
        },
        validationAction : "error"
    }


const normalChatsCollectionSchema = {
        validator : {
            $jsonSchema : {
                properties : {
                chat : {
                    bsonType : "array",
                    items : {
                        bsonType : "object",
                        required : ["id", "userId", "time"],
                        properties : {
                            id : {
                                bsonType : "objectId"
                            },
                            userId : {
                                bsonType : "objectId"
                            },
                            content : {
                                bsonType : "string"
                            },
                            path : {
                                bsonType : "string"
                            },
                            time : {
                                bsonType : "date"
                            }
                        }
                    }
                }
            }
            }
        },
        validationAction : "error"
    }

const groupChatsCollectionSchema = {
        validator : {
            $jsonSchema : {
                properties : {
                chat : {
                    bsonType : "array",
                    items : {
                        bsonType : "object",
                        required : ["id", "userId", "time"],
                        properties : {
                            id : {
                                bsonType : "objectId"
                            },
                            userId : {
                                bsonType : "objectId"
                            },
                            content : {
                                bsonType : "string"
                            },
                            path : {
                                bsonType : "string",
                            },
                            time : {
                                bsonType : "date"
                            }
                        }
                    }
                }
            }
            }
        },
        validationAction : "error"
    }

const tokensCollectionSchema = 
    {
        validator : {
            $jsonSchema : {
                required : ["token"],
                properties : {
                    token : {
                        bsonType : "string"
                    }
                }
            }
        }
    }

module.exports = {
    usersCollectionSchema,
    normalChatsCollectionSchema,
    groupChatsCollectionSchema,
    tokensCollectionSchema
}