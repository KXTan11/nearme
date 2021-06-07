FROM node:12

WORKDIR /app

ADD package.json /app/package.json
RUN npm install

ADD . /app

ENV NODE_ENV='production'
ENV LOG_LEVEL='error'

ENV PUBLIC_SERVER_URL='https://nearmev5.quanlabs.com'
ENV PARSE_SERVER_MOUNT='/api'

ENV APP_NAME='Nearme'

# Use random.org to generate a random string for the APP_ID and MASTER_KEY
# Example: https://www.random.org/strings/?num=10&len=10&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new

ENV APP_ID='YOUR_APP_ID'
ENV MASTER_KEY='YOUR_MASTER_KEY'
ENV READ_ONLY_MASTER_KEY='YOUR_READ_ONLY_MASTER_KEY'

ENV VERIFY_USER_EMAILS=false

ENV CURRENCY='USD'
ENV CUSTOM_LANG='en'

ENV GOOGLE_CLIENT_ID='YOUR_GOOGLE_CLIENT_ID'

ENV STRIPE_SECRET_KEY='YOUR_STRIPE_SECRET_KEY'
ENV STRIPE_WEBHOOK_SECRET='YOUR_STRIPE_WEBHOOK_SECRET'

ENV ONE_SIGNAL_APP_ID='YOUR_ONE_SIGNAL_APP_ID'
ENV ONE_SIGNAL_API_KEY='YOUR_ONE_SIGNAL_API_KEY'

ENV MAILGUN_API_KEY='YOUR_MAILGUN_API_KEY'
ENV MAILGUN_DOMAIN='mg.yourdomain.com'
ENV MAILGUN_FROM_ADDRESS='Your company name <noreply@yourdomain.com>'
ENV MAILGUN_PUBLIC_LINK='https://your.app'

# Mailgun host (default: 'api.mailgun.net'). 
# When using the EU region, the host should be set to 'api.eu.mailgun.net'
ENV MAILGUN_HOST='api.mailgun.net'

ENV GOOGLE_MAPS_API_KEY='GOOGLE_MAPS_API_KEY'

ENV PUSH_ANDROID_SENDER_ID='ANDROID_SENDER_ID'
ENV PUSH_ANDROID_API_KEY='ANDROID_API_KEY'
ENV PUSH_IOS_BUNDLE_ID='com.quanlabs.nearme5'

ENV MAX_REQUEST_SIZE='20mb'
ENV DOKKU_LETSENCRYPT_EMAIL='dev@quanlabs.com'

# Generate an encrypted password for your parse dashboard user
# https://bcrypt-generator.com/
ENV PARSE_DASHBOARD_USER='admin'
ENV PARSE_DASHBOARD_PASS='$2y$12$FjjhORnNdorLBNbkhVTP0e..HwP3fRKov9wYmo.2mGsJ4y96AviZm'

ENV PARSE_DASHBOARD_USER_READ_ONLY='admin1'
ENV PARSE_DASHBOARD_PASS_READ_ONLY='$2y$12$6b7CuxcN7oZ4tkd7iQetOOdJOaVDajPiDrq2tjfxo0QP7DEbcirKW'