pipeline {
    agent any
    
    environment {
        BUILD_ID = "dontKillMe"
        JENKINS_NODE_COOKIE = "dontKillMe"
    }
    
    triggers {
        githubPush()
    }

    stages {
        stage('Clean Workspace') {
            steps {
                // Clean before build
                cleanWs()
            }
        }

        stage('Check User') {
            steps {
                sh 'echo "Running as: $(whoami)"'
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/YogeshAbnave/nirmala-bag-erp-backend.git'
            }
        }
        stage('Stop All Application') {
            steps {
                sh '/var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/node_modules/forever/bin/forever stopall'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                /var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/npm cache clean --force
                /var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/npm install --legacy-peer-deps
                /var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/npm install forever --force
                '''
            }
        }

        stage('Run Security Audit') {
            steps {
                sh '/var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/npm audit || true'
            }
        }

        stage('Start Application') {
            steps {
                // Ensure the script is executable and then run it
                sh '''
                if [ -f startNode.sh ]; then
                    chmod +x startNode.sh
                    ./startNode.sh
                else
                    echo "Error: startNode.sh not found!"
                    exit 1
                fi
                '''
            }
        }

        stage('Validate Application') {
            steps {
                sh '''
                /var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/node_modules/forever/bin/forever list
                '''
            }
        }
    }

    post {
        success {
            echo 'Application deployed successfully! hello word'
        }
        failure {
            echo 'Deployment failed. Check logs.'
        }
    }
}
