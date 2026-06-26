output "resource_group_name" {
  value = azurerm_resource_group.mk_aks_rg.name
}

output "kubernetes_cluster_name" {
  value = azurerm_kubernetes_cluster.mk_aks.name
}

output "kube_config" {
  value     = azurerm_kubernetes_cluster.mk_aks.kube_config_raw
  sensitive = true
}

