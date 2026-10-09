import requests
from database import SessionLocal
from models import User, CareCircle, CareCircleMember
from sqlalchemy.orm import Session

API_KEY = "AIzaSyAbkQ6Bgf_JSdlNgDViXWuaNiFIOAGRT80"
SIGNUP_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"

db = SessionLocal()

users_data = [
    {"email": "krupa@calmspace.com", "password": "password123", "name": "Krupa", "role": "child"},
    {"email": "deepa@calmspace.com", "password": "password123", "name": "Deepa", "role": "parent"},
    {"email": "savitha@calmspace.com", "password": "password123", "name": "Savitha", "role": "caregiver"},
    {"email": "kishore@calmspace.com", "password": "password123", "name": "Kishore", "role": "doctor"}
]

created_users = {}

for u in users_data:
    try:
        # Sign up using Firebase REST API
        resp = requests.post(SIGNUP_URL, json={
            "email": u["email"],
            "password": u["password"],
            "returnSecureToken": True
        })
        
        # If user exists, we might get an error, but let's try to handle it gracefully if possible.
        uid = None
        if resp.status_code == 200:
            uid = resp.json().get("localId")
            print(f"Created Firebase user {u['email']}")
        else:
            error_message = resp.json().get("error", {}).get("message", "")
            if error_message == "EMAIL_EXISTS":
                # User already exists in Firebase, just use a dummy UID or query DB
                print(f"User {u['email']} already exists in Firebase.")
            else:
                print(f"Error creating Firebase user {u['email']}: {error_message}")
                
        db_user = db.query(User).filter(User.email == u["email"]).first()
        if not db_user:
            db_user = User(
                firebase_uid=uid or f"dummy_{u['name'].lower()}",
                email=u["email"],
                name=u["name"],
                role=u["role"]
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            print(f"Added {u['email']} to local DB.")
        else:
            if uid and db_user.firebase_uid != uid:
                db_user.firebase_uid = uid
                db.commit()
                db.refresh(db_user)
        
        created_users[u["role"]] = db_user
            
    except Exception as e:
        print(f"Error processing {u['email']}: {e}")

print("\nSetting up Care Circle...")
parent = created_users.get("parent")
child = created_users.get("child")
doctor = created_users.get("doctor")
caregiver = created_users.get("caregiver")

if parent and child and doctor and caregiver:
    circle = db.query(CareCircle).filter(CareCircle.owner_user_id == parent.id).first()
    if not circle:
        circle = CareCircle(
            name="Krupa's Care Circle",
            child_name=child.name,
            owner_user_id=parent.id
        )
        db.add(circle)
        db.commit()
        db.refresh(circle)
        print("Created Care Circle.")
    else:
        print("Care Circle already exists.")
        
    roles_to_add = [
        (parent.id, parent.email, "parent"),
        (doctor.id, doctor.email, "doctor"),
        (caregiver.id, caregiver.email, "caregiver")
    ]
    
    for uid, email, role in roles_to_add:
        member = db.query(CareCircleMember).filter(
            CareCircleMember.circle_id == circle.id,
            CareCircleMember.user_id == uid
        ).first()
        
        if not member:
            member = CareCircleMember(
                circle_id=circle.id,
                user_id=uid,
                invited_email=email,
                role=role,
                status="active"
            )
            db.add(member)
            print(f"Added {role} to Care Circle.")
            
    db.commit()
    print("Done setting up members.")
else:
    print("Missing some users, could not create Care Circle.")

