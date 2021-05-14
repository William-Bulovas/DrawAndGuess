FROM amazon/aws-lambda-nodejs:14

# Create app directory
WORKDIR /var/task

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY tsconfig-docker.json tsconfig.json

# Bundle app source
COPY src/lambda src/lambda
COPY src/logic src/logic
COPY src/model src/model
COPY model model

RUN npm run ts-build

CMD [ "src/lambda/onGuess.handler" ]