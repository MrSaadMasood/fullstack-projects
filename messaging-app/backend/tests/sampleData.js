exports.users = [
    {
        "_id": 1,
        "fullName": "user1",
        "email": "user1@gmail.com",
        "password": "$2b$10$SHsGKDrnlp3Ih7H/iUdkLeodEXLC3G2Lsj1VzfFm8yOsB3NDSYHhK",
        "friends": [
            {
            "$oid": "65bbb207c05731ef6b25ad19"
            },
            {
            "$oid": "65bcc471e30a163b04040db1"
            },
            {
            "$oid": "65cf52dc207bb6485053c901"
            },
            {
            "$oid": "65cf52dc207bb6485053c901"
            }
        ],
        "receivedRequests": [],
        "sentRequests": [
            {
            "$oid": "65bbe5050bc7f90fce7ab137"
            },
            {
            "$oid": "65bbe4010bc7f90fce7ab134"
            },
            {
            "$oid": "65bbe4350bc7f90fce7ab135"
            },
            {
            "$oid": "65bbe5270bc7f90fce7ab138"
            },
            {
            "$oid": "65bbe57d0bc7f90fce7ab13a"
            }
        ],
        "bio": "this is saad masood this apps creator",
        "profilePicture": "image-1708026988991581479363.jpg",
        "normalChats": [
            {
            "friendId": {
                "$oid": "65bcc471e30a163b04040db1"
            },
            "collectionId": {
                "$oid": "65ce6e271673e9ea756f06ff"
            }
            },
            {
            "friendId": {
                "$oid": "65cf52dc207bb6485053c901"
            },
            "collectionId": {
                "$oid": "65cf535a207bb6485053c904"
            }
            }
        ],
        "groupChats": [
            {
            "id": {
                "$oid": "65ce707f1673e9ea756f0705"
            },
            "members": [
                {
                "$oid": "65bbb207c05731ef6b25ad19"
                },
                {
                "$oid": "65bcc471e30a163b04040db1"
                },
                {
                "$oid": "65bb556b3630cc7c7fca24bf"
                }
            ],
            "admins": [
                {
                "$oid": "65bb556b3630cc7c7fca24bf"
                }
            ],
            "collectionId": {
                "$oid": "65ce707d1673e9ea756f0703"
            },
            "groupName": "rangers",
            "groupImage": null
            },
            {
            "id": {
                "$oid": "65ce70ad1673e9ea756f0708"
            },
            "members": [
                {
                "$oid": "65bbb207c05731ef6b25ad19"
                },
                {
                "$oid": "65bcc471e30a163b04040db1"
                },
                {
                "$oid": "65bb556b3630cc7c7fca24bf"
                }
            ],
            "admins": [
                {
                "$oid": "65bb556b3630cc7c7fca24bf"
                }
            ],
            "collectionId": {
                "$oid": "65ce70aa1673e9ea756f0706"
            },
            "groupName": "random",
            "groupImage": null
            },
            {
            "id": {
                "$oid": "65ce70d61673e9ea756f070b"
            },
            "members": [
                {
                "$oid": "65bbb207c05731ef6b25ad19"
                },
                {
                "$oid": "65bcc471e30a163b04040db1"
                },
                {
                "$oid": "65bb556b3630cc7c7fca24bf"
                }
            ],
            "admins": [
                {
                "$oid": "65bb556b3630cc7c7fca24bf"
                }
            ],
            "collectionId": {
                "$oid": "65ce70d41673e9ea756f0709"
            },
            "groupName": "another sample",
            "groupImage": "image-1708028116229864709855.jpg"
            }
        ]
          }
]