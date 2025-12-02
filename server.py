from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import base64
import os
from dotenv import load_dotenv

load_dotenv()

# Email configuration
EMAIL_USER = os.environ.get('EMAIL_USER')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD')



class CustomHandler(SimpleHTTPRequestHandler):
    """Custom handler that serves static files and handles POST requests"""

    def end_headers(self):
        """Add CORS headers to allow browser requests"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        """Handle POST requests for email sending"""

        print(f"\n{'=' * 60}")
        print(f"POST request received: {self.path}")
        print(f"{'=' * 60}")

        # Endpoint just for testing
        if self.path == '/api/ping':
            print("Ping endpoint hit.")
            try:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()

                response = json.dumps({'status': 'pong', 'message': 'Server is responding!'})
                self.wfile.write(response.encode('utf-8'))
                self.wfile.flush()

                print("Ping response sent.\n")
                return
            except Exception as e:
                print(f"Error in ping: {e}")
                import traceback
                traceback.print_exc()
                return

        # Handle /api/send-email endpoint
        if self.path == '/api/send-email':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)

                data = json.loads(post_data.decode('utf-8'))

                to_email = data.get('email')
                emotion = data.get('emotion', 'unknown')
                image_base64 = data.get('image')

                print(f"Email: {to_email}, Emotion: {emotion}")

                # Validate
                if not to_email or not image_base64:
                    print("Validation failed: missing data")
                    self.send_error_response(400, 'Missing email or image')
                    return

                if '@' not in to_email:
                    print("Validation failed: invalid email")
                    self.send_error_response(400, 'Invalid email address')
                    return

                # Remove data URL prefix if present
                if 'base64,' in image_base64:
                    image_base64 = image_base64.split('base64,')[1]
                elif ',' in image_base64:
                    image_base64 = image_base64.split(',')[1]

                # Remove any whitespace
                image_base64 = image_base64.strip().replace('\n', '').replace('\r', '').replace(' ', '')

                # Fix padding (must be multiple of 4)
                padding_needed = len(image_base64) % 4
                if padding_needed:
                    image_base64 += '=' * (4 - padding_needed)

                # Decode base64 to bytes
                try:
                    image_data = base64.b64decode(image_base64)
                except Exception as e:
                    print(f"Base64 decode failed: {e}")
                    self.send_error_response(400, f'Invalid base64: {str(e)}')
                    return

                # Send email
                success = self.send_email(to_email, emotion, image_data)

                if success:
                    # Send success response
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    response = json.dumps({
                        'success': True,
                        'message': 'Email sent successfully!'
                    })
                    self.wfile.write(response.encode('utf-8'))
                    print(f"Email sent to {to_email} - emotion: {emotion}")
                else:
                    self.send_error_response(500, 'Failed to send email')

            except json.JSONDecodeError:
                self.send_error_response(400, 'Invalid JSON data')
            except Exception as e:
                print(f"Error: {str(e)}")
                self.send_error_response(500, str(e))
        else:
            # Unknown POST endpoint
            self.send_error_response(404, 'Endpoint not found')

    def send_error_response(self, code, message):
        """Send JSON error response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        response = json.dumps({'error': message})
        self.wfile.write(response.encode('utf-8'))

    def send_email(self, to_email, emotion, image_data):
        """Send email with image attachment"""
        server = None

        try:
            print(f"\n=== Attempting to send email ===")
            print(f"From: {EMAIL_USER}")
            print(f"To: {to_email}")
            print(f"Image size: {len(image_data)} bytes")

            # Create email message
            msg = MIMEMultipart()
            msg['From'] = EMAIL_USER
            msg['To'] = to_email
            msg['Subject'] = 'Here are Your Feelings Drawing & Resources'

            # Email body HTML
            html_body = f"""
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Your Feelings Drawing</h2>
                <p>Thank you for exploring your emotions with Mind Your Feelings.</p>
                <p>Your drawing and resources are attached to this email.</p>
                <p>Take care, </p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 12px;">Mind Your Feelings</p>
              </body>
            </html>
            """

            msg.attach(MIMEText(html_body, 'html'))

            # Attach the image
            image_attachment = MIMEImage(image_data)
            image_attachment.add_header('Content-Disposition', 'attachment',
                                        filename='feelings-drawing.png')
            msg.attach(image_attachment)

            print("Connecting to Gmail SMTP...")

            # Send via Gmail SMTP
            with smtplib.SMTP('smtp.gmail.com', 587, timeout=10) as server:
                server.starttls()

                print(f"Logging in as {EMAIL_USER}...")
                server.login(EMAIL_USER, EMAIL_PASSWORD)

                print("Sending message...")
                server.send_message(msg)

            print(f"Email sent successfully!\n")
            return True

        except smtplib.SMTPAuthenticationError as e:
            print(f"SMTP Authentication failed!")
            print(f"Error: {e}")
            print(f"Check: Is EMAIL_USER correct? Is EMAIL_PASSWORD an app password?")
            return False

        except smtplib.SMTPException as e:
            print(f"SMTP error: {e}")
            return False

        except Exception as e:
            print(f"Email sending failed: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


def run_server(port=1024):
    """Start the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, CustomHandler)

    print("Mind Your Feelings - Server\n")
    print(f"Server running at: http://localhost:{port}\n")
    print(f"Email configured: {EMAIL_USER}\n")
    print("\nServing files and handling email requests...\n")
    print("Press Ctrl+C to stop\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        httpd.server_close()


if __name__ == '__main__':
    run_server(1024)  # Use your preferred port
