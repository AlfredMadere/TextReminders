FROM lambci/lambda:build-nodejs12.x

ENV AWS_DEFAULT_REGION us-east-1

COPY . .

RUN npm install

RUN zip -9yr lambda.zip .

CMD aws lambda update-function-code --function-name testFunction --zip-file fileb://lambda.zip