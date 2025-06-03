from flask import Flask, request, jsonify
from datetime import datetime, date

app = Flask(__name__) 

@app.route("/") 
def hello_world(): 
	return "Hello, World!"

@app.route("/user")
def user_page():
	return "This is user page"

@app.route('/user/<int:user_id>')
def show_user(user_id):
    return f"User ID is {user_id}"

@app.route('/user/add', methods=['POST'])
def add_user():
    data = request.get_json()  # Get JSON data from request
    name = data.get('name')
    email = data.get('email')
    age = data.get('age')

    return jsonify({
        'message': 'User added successfully',
        'name': name,
        'email': email,
        'age': age
    })

@app.route('/user/birth', methods=['POST'])
def calculate_birth_info():
    data = request.get_json()
    dob_str = data.get('date_of_birth')  # Expected format: YYYY-MM-DD

    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
        today = date.today()

        # Age in years
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

        # Days and months since birth
        days_since_birth = (today - dob).days
        months_since_birth = (today.year - dob.year) * 12 + today.month - dob.month
        if today.day < dob.day:
            months_since_birth -= 1

        # Day of the week and month name
        weekday = dob.strftime('%A')         # e.g., Sunday
        month_name = dob.strftime('%B')      # e.g., June
        birth_year = dob.year
        born_day = dob.day

        return jsonify({
            'age': age,
            'days_since_birth': days_since_birth,
            'months_since_birth': months_since_birth,
            'day_of_week_born': weekday,
            'day': born_day,
            'birth_month_name': month_name,
            'birth_year': birth_year
        })

    except Exception as e:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000, debug=True)