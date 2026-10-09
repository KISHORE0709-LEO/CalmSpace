import sqlite3
from stream_chat import StreamChat

API_KEY = "3bqnsehm27u2"
API_SECRET = "mgtprct4eh86u6qx2yjcg6wqpj7x5e9ps4a5nvxacnq98x3xc7tncheyuzx2gvpv"
chat = StreamChat(api_key=API_KEY, api_secret=API_SECRET)

conn = sqlite3.connect('calmspace.db')
cursor = conn.cursor()
cursor.execute("SELECT email, firebase_uid, name, role FROM users WHERE email IN ('krupa@calmspace.com', 'deepa@calmspace.com', 'savitha@calmspace.com', 'kishore@calmspace.com')")
db_users = cursor.fetchall()

users = []
member_ids = []
deepa_id = None

for u in db_users:
    uid = u[1]
    name = u[2]
    role = "admin" if name == "Deepa" else "user"
    if name == "Deepa":
        deepa_id = uid
    member_ids.append(uid)
    users.append({"id": uid, "name": name, "role": role})

chat.upsert_users(users)
channel = chat.channel("messaging", "care-circle-krupa", {
    "name": "Krupa's Care Circle",
    "created_by_id": deepa_id
})
channel.create(deepa_id)
channel.add_members(member_ids, message={"text": "Welcome to Krupa's Care Circle!"})
print("Stream channel created successfully with members:", member_ids)

