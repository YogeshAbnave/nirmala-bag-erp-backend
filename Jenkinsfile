pipeline {
    agent any
   
    stages {
        stage('Build') {
            steps {
                // Clean before build
                cleanWs()
            }
        }
        stage('Checkout Code') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/YogeshAbnave/nirmala-bag-erp-backend.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                /var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/npm  cache clean --force
                /var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/npm  install --legacy-peer-deps
                /var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/npm  install forever --force
                '''
            }
        }
        
        stage('Run Security Audit') {
            steps {
                sh '/var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/npm  audit || true'
            }
        }
        
        stage('Start Application') {
            steps {
                script {
                    sh '''
                        chmod +x startNode.sh
                        ./startNode.sh
                    '''
                }
            }
        }
        stage('Validate Application') {
            steps {
                script {
                    sh '''
                        /var/lib/jenkins/nodejs/node-v22.13.1-linux-x64/bin/node_modules/forever/bin/forever list
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Application deployed successfully!'
        }
        failure {
            echo 'Deployment failed. Check logs.'
        }

    }
}