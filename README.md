# Douglas-Kubernetes-Based-Microservice-Deployment-with-Observability-on-AKS

The name Douglas has no real meaning behind it, 
	I just googled Endrick (the Brazilian football player) on a whim and found out that his father's name was Dougleas - since it was the first person name that popped up on Endrick's wikipedia page I went for it.
This was my first time writing [[Documentation]]


## Instructions for the task
```
- Dockerize (locally) simple web application.
      - create a dockerfile  
      - build docker image  
               - upload to docker registry.  

- Install and use terraform on azure.  
      - Configure remote state (blob storage account).  

- Using Terraform, create and configure an AKS Cluster on Azure and deploy web application from the first task.  

- Use by choice scripting language and do some file operations, like:  
      Write text to file.  
      Copy content of one file to another.  
      Filter content of file by choice, (example. count dots, lines, or find words starting with 'xyz*').  

- Implement monitoring and logging for a web application using Grafana.  
- By choice, create a simple cronjob, deploy to AKS, ie: print current time.  
- Use Azure Quota API to retrieve list of quota limits for subscription or scope. (python, bash or powershell)  
- Use any Read.Me file or another documentation for outputs and results from steps
```

## Steps taken
### app setup + Docker
I took the liberty of setting up a very basic app just so that I have something to create a docker image out of, so that I can get to the setup part of the exercise.
the js app looks as follows: 
```javascript
//app.js
const express = require('express');

const app = express();

  

app.get('/', (req, res) => {

  res.send('Hello from AKS!');

});

  

app.listen(3000, () => {

  console.log('App running on port 3000');

});
//since this is an express app, I used the option of not setting up a package.json manually. I let express specific commands do their thing
```

with this one out of the way the Dockerfile looks like this:

```Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```
and a docker build and push later I ran into a bit of trouble with the cluster setup;
```sh
docker build -t memoko/mk-simple-app:v1 .

docker push memoko/mk-simple-app:v1
```
and that then brings us to the cluster setup, here I initially fought tooth and nail to get 2 VMs to work as the cluster, but I couldn't get them to run consistently, so I yielded to the aks cluster mafia and provisioned one for myself with a single node pool. Terraform was used for the provisioning (even though copilot tried to get me to use the az console all day today) 

```shell
terraform init -backend-config="backend.hcl" #setup file
terraform plan
terraform apply
```

Deployment looked like this:
```shell
kubectl apply -f deployment.yaml

kubectl apply -f service.yaml
```
And could be tested using 
```shell
kubectl get svc
```

---

### Grafana setup

Now that the docker image was made available, and the setup went over *smoothly*, it was time to setup Grafan
```shell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm install mk-monitoring prometheus-community/kube-prometheus-stack

kubectl port-forward svc/mk-monitoring-grafana 3000:80
```
(on a local setup this may or may not prevent us from accessing the app, since it was setup to run on port 3000 too. For this specific use case (applikacjon borxh) it does not matter, but it can be taken care of by simply moving the app port allocation to say 3001).

one Grafana login later, using the admin username of course:
```shell 
#first we need to open grafana under: 
	http://localhost:3000

#and then find the password
	kubectl get secret mk-monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

After the setup was completed, I added 2 Grafana graphs, one for CPU and one for memory monitoring. I don't know if I am supposed to put those in here or not, *but I am skipping it for now*.

---
### Scripts and CronJob's

the cronjob in question:
```yaml
apiVersion: batch/v1

kind: CronJob

metadata:

  name: mk-time-printer

spec:

  schedule: "*/1 * * * *"

  jobTemplate:

    spec:

      template:

        spec:

          containers:

          - name: time

            image: busybox

            args:

            - /bin/sh

            - -c

            - date

          restartPolicy: OnFailure
```

the quota script in question:
```python
#for this to work, you need to be logged into the azure cli (only time I used it, again, copilot was trying to make me use this as if it's online status depended on it)
import requests
from azure.identity import DefaultAzureCredential

subscription_id = "3b60d65a-bb1c-4e86-ad35-8cd3ef537fbf"

cred = DefaultAzureCredential()

token = cred.get_token("https://management.azure.com/.default").token

url = f"https://management.azure.com/subscriptions/{subscription_id}/providers/Microsoft.Compute/locations/westeurope/usages?api-version=2021-07-01"

headers = {
    "Authorization": f"Bearer {token}"
}

response = requests.get(url, headers=headers)

print(response.json())
```
 
 aaand that's more or less it, this was my first time writing actual documentation outside of uni reports, hope the not so dry tone was not a bore to get through.

note:
  as of time of writing this, we are are on v8 already!
---

 
