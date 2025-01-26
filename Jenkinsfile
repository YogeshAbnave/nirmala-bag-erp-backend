pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                // Explicit Git clone command with remote cleanup
                sh '''
                git init
                git remote remove origin || true
                git remote add origin https://github.com/YogeshAbnave/nirmala-bag-erp-backend.git
                git fetch origin
                git checkout main
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install dependencies with sharp specifically
                sh '''
                npm install --force
                npm install sharp --force
                '''
            }
        }

        stage('Lint and Test') {
            steps {
                // Run lint and test scripts
                sh 'npm run lint || echo "Linting errors found."'
                sh 'npm test || echo "Tests failed."'
            }
        }

        stage('Start Application') {
            steps {
                // Run the application in the background using nohup
                sh '''
                nohup npm start &> app.log &
                sleep 60 # Wait for 60 seconds to allow the application to start
                tail -n 10 app.log # Show the last 10 lines of the log for verification
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
    }
}
