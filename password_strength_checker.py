import re
import random
import string
from datetime import datetime

# Common passwords list (can be expanded)
COMMON_PASSWORDS = [
    'password', '123456', 'qwerty', 'letmein', 'admin',
    'welcome', 'monkey', 'password1', '12345678'
]

class PasswordChecker:
    def __init__(self):
        self.password_history = []
        
    def check_strength(self, password):
        """Evaluate password strength and provide detailed feedback"""
        results = {
            'length': len(password) >= 8,
            'uppercase': bool(re.search(r'[A-Z]', password)),
            'lowercase': bool(re.search(r'[a-z]', password)),
            'number': bool(re.search(r'[0-9]', password)),
            'special_char': bool(re.search(r'[^A-Za-z0-9]', password)),
            'not_common': password.lower() not in COMMON_PASSWORDS,
            'no_consecutive': not self.has_consecutive_chars(password),
            'no_repeats': not self.has_repeated_chars(password)
        }
        
        strength_score = sum(results.values())
        strength_level = self.get_strength_level(strength_score)
        
        feedback = {
            'strength': strength_level,
            'score': strength_score,
            'details': results,
            'suggestions': self.get_suggestions(results)
        }
        
        # Add to history
        self.password_history.append({
            'password': password,
            'timestamp': datetime.now(),
            'strength': strength_level
        })
        
        return feedback
    
    def get_strength_level(self, score):
        """Determine strength level based on score"""
        if score <= 2:
            return "Very Weak"
        elif score <= 4:
            return "Weak"
        elif score <= 6:
            return "Moderate"
        elif score <= 8:
            return "Strong"
        return "Very Strong"
    
    def get_suggestions(self, results):
        """Provide suggestions based on missing criteria"""
        suggestions = []
        if not results['length']:
            suggestions.append("Use at least 8 characters")
        if not results['uppercase']:
            suggestions.append("Add uppercase letters")
        if not results['lowercase']:
            suggestions.append("Add lowercase letters")
        if not results['number']:
            suggestions.append("Add numbers")
        if not results['special_char']:
            suggestions.append("Add special characters")
        if not results['not_common']:
            suggestions.append("Avoid common passwords")
        if not results['no_consecutive']:
            suggestions.append("Avoid consecutive characters")
        if not results['no_repeats']:
            suggestions.append("Avoid repeated characters")
        return suggestions
    
    def has_consecutive_chars(self, password):
        """Check for consecutive characters"""
        for i in range(len(password) - 1):
            if ord(password[i+1]) == ord(password[i]) + 1:
                return True
        return False
    
    def has_repeated_chars(self, password):
        """Check for repeated characters"""
        return len(set(password)) != len(password)
    
    def generate_password(self, length=12):
        """Generate a strong password"""
        chars = string.ascii_letters + string.digits + string.punctuation
        while True:
            password = ''.join(random.choice(chars) for _ in range(length))
            if self.check_strength(password)['strength'] in ['Strong', 'Very Strong']:
                return password
    
    def get_history(self):
        """Get password check history"""
        return self.password_history

# Example usage
if __name__ == "__main__":
    checker = PasswordChecker()
    
    while True:
        print("\nPassword Strength Checker")
        print("1. Check password strength")
        print("2. Generate strong password")
        print("3. View check history")
        print("4. Exit")
        
        choice = input("Select an option: ")
        
        if choice == '1':
            password = input("Enter password: ")
            result = checker.check_strength(password)
            print(f"\nPassword Strength: {result['strength']}")
            print("Details:")
            for k, v in result['details'].items():
                print(f"- {k.replace('_', ' ').title()}: {'✓' if v else '✗'}")
            if result['suggestions']:
                print("\nSuggestions for improvement:")
                for suggestion in result['suggestions']:
                    print(f"- {suggestion}")
                    
        elif choice == '2':
            length = int(input("Enter password length (default 12): ") or 12)
            password = checker.generate_password(length)
            print(f"\nGenerated Password: {password}")
            result = checker.check_strength(password)
            print(f"Strength: {result['strength']}")
            
        elif choice == '3':
            history = checker.get_history()
            if history:
                print("\nPassword Check History:")
                for entry in history:
                    print(f"{entry['timestamp']}: {entry['password']} ({entry['strength']})")
            else:
                print("No history available")
                
        elif choice == '4':
            print("Exiting...")
            break
            
        else:
            print("Invalid choice. Please try again.")
