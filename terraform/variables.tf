variable "location" {
  default = "westeurope"
}

variable "resource_group_name" {
  default = "mk-aks-rg"
}

variable "cluster_name" {
  default = "mk-aks-cluster"
}

variable "dns_prefix" {
  default = "mkaks"
}

variable "node_count" {
  default = 1
}

variable "vm_size" {
  default = "Standard_B2s"
}