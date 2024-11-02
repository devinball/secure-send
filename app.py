from flask import Flask, render_template, redirect, request, abort
from data import get_data, register_data, purge_old_data

app = Flask(__name__)

@app.route("/")
def home():
    return redirect("/create")

@app.route("/create")
def create():
    return render_template("create.html")

@app.route("/create", methods=["POST"])
def create_post():
    data = request.data.decode("UTF8")
    data_id = register_data(data)
    print(data_id)
    return {
        "data_id" : data_id
    }

@app.route("/result")
def result():
    return render_template("result.html")

@app.route("/retrieve/<data_id>")
def retrieve(data_id):
    purge_old_data()
    data = get_data(data_id)
    if data:
        return render_template("retrieve.html", data=data)
    return abort(404)
