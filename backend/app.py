from flask import Flask, render_template, request, send_file
import joblib
import numpy as np
from fpdf import FPDF
import os

app = Flask(__name__)

# Load model and encoders
model = joblib.load("career_rf_model.pkl")
le_passion, le_hobby, le_edu, le_career, mlb_skills = joblib.load("sklearn_encoders.pkl")

# Load options for frontend dropdowns
passions = list(le_passion.classes_)
hobbies = list(le_hobby.classes_)
educations = list(le_edu.classes_)
skills_list = mlb_skills.classes_
ages = list(range(15, 66))

@app.route("/")
def index():
    return render_template("form.html", passions=passions, hobbies=hobbies, educations=educations, skills=skills_list, ages=ages)

@app.route("/predict", methods=["POST"])
def predict():
    # Get form data
    passion = request.form.get("passion")
    hobby = request.form.get("hobby")
    edu = request.form.get("education")
    age = int(request.form.get("age"))
    skills = request.form.getlist("skills")

    # Encode input
    x_input = [
        le_passion.transform([passion])[0],
        le_hobby.transform([hobby])[0],
        le_edu.transform([edu])[0],
        age
    ]
    skill_vector = mlb_skills.transform([skills])[0]
    full_input = np.concatenate([x_input, skill_vector])

    # Predict
    pred = model.predict([full_input])[0]
    career_name = le_career.inverse_transform([pred])[0]

    # Explanation: top 5 features by importance (basic)
    importances = model.feature_importances_
    top_indices = np.argsort(importances)[::-1][:5]
    feature_names = ["passion", "hobby", "education", "age"] + list(mlb_skills.classes_)
    explanation = [(feature_names[i], round(importances[i], 4)) for i in top_indices]

    return render_template("result.html", career=career_name, explanation=explanation)

@app.route("/download-pdf", methods=["POST"])
def download_pdf():
    career = request.form.get("career")
    explanation = request.form.get("explanation")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Predicted Career Path: {career}", ln=1)
    pdf.multi_cell(0, 10, txt=f"Reasoning:\n{explanation}")
    pdf.output("result.pdf")

    return send_file("result.pdf", as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)