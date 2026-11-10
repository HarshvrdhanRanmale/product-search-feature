pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check tools') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'docker info --format "Docker server: {{.ServerVersion}}"'
            }
        }

        stage('Install, test, and build') {
            steps {
                dir('product-search') {
                    bat 'npm ci'
                    bat 'npm test'
                    bat 'npm run build'
                }
            }
        }

        stage('Build Docker image') {
            steps {
                bat 'docker build -t product-search:1.0 product-search'
            }
        }

        stage('Run and verify container') {
            steps {
                bat '''
docker rm -f product-search-local 2>NUL
docker run -d --name product-search-local -p 3001:3000 product-search:1.0
powershell -NoProfile -Command "Start-Sleep -Seconds 2; $health = Invoke-RestMethod 'http://localhost:3001/health'; if ($health.status -ne 'UP') { exit 1 }"
powershell -NoProfile -Command "$items = Invoke-RestMethod 'http://localhost:3001/api/products'; if ($items.Count -ne 6) { exit 1 }"
'''
            }
        }
    }
}