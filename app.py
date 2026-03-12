from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db import get_connection
import os

app = Flask(__name__)

CORS(app)

@app.route("/")
def home():
    return send_from_directory(".", "login.html")


# ---------- REGISTER ----------
@app.route("/register", methods=["POST"])
def register():

    username = request.form.get("username")
    email = request.form.get("email")
    password = request.form.get("password")

    con = get_connection()
    cur = con.cursor()

    sql = "INSERT INTO users(username,email,password,role) VALUES(%s,%s,%s,'STUDENT')"

    cur.execute(sql,(username,email,password))
    con.commit()

    cur.close()
    con.close()

    return "SUCCESS"


# ---------- LOGIN ----------
@app.route("/login", methods=["POST"])
def login():

    username = request.form.get("username")
    password = request.form.get("password")

    con = get_connection()
    cur = con.cursor()

    cur.execute("""
    SELECT role FROM users
    WHERE LOWER(username)=LOWER(%s) AND password=%s
    """,(username,password))

    result = cur.fetchone()

    cur.close()
    con.close()

    if result:
        return result[0]
    else:
        return "INVALID"


# ---------- GET NOTES ----------
@app.route("/getNotes")
def getNotes():

    year = request.args.get("year")

    con = get_connection()
    cur = con.cursor()

    if year:
        cur.execute(
            "SELECT id,title,description,file_url,category,year FROM notes WHERE year=%s",
            (year,)
        )
    else:
        cur.execute(
            "SELECT id,title,description,file_url,category,year FROM notes"
        )

    rows = cur.fetchall()

    notes = []

    for r in rows:
        notes.append({
            "id": r[0],
            "title": r[1],
            "description": r[2],
            "file_url": r[3],
            "category": r[4],
            "year": r[5]
        })

    cur.close()
    con.close()

    return jsonify(notes)


# ---------- UPLOAD NOTE ----------
@app.route("/uploadNote", methods=["POST"])
def uploadNote():

    title = request.form.get("title")
    desc = request.form.get("description")
    url = request.form.get("fileUrl")
    category = request.form.get("category")
    year = request.form.get("year")

    con = get_connection()
    cur = con.cursor()

    sql = "INSERT INTO notes(title,description,file_url,category,year) VALUES(%s,%s,%s,%s,%s)"

    cur.execute(sql,(title,desc,url,category,year))
    con.commit()

    cur.close()
    con.close()

    return "SUCCESS"


# ---------- DELETE NOTE ----------
@app.route("/deleteNote")
def deleteNote():

    id = request.args.get("id")

    con = get_connection()
    cur = con.cursor()

    cur.execute("DELETE FROM notes WHERE id=%s",(id,))
    con.commit()

    cur.close()
    con.close()

    return "SUCCESS"


# ---------- UPDATE NOTE ----------
@app.route("/updateNote", methods=["POST"])
def updateNote():

    data = request.json

    id = data["id"]
    title = data["title"]
    desc = data["description"]
    category = data["category"]
    year = data["year"]

    con = get_connection()
    cur = con.cursor()

    sql = "UPDATE notes SET title=%s,description=%s,category=%s,year=%s WHERE id=%s"

    cur.execute(sql,(title,desc,category,year,id))
    con.commit()

    cur.close()
    con.close()

    return "SUCCESS"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
