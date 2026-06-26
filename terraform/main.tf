resource "azurerm_resource_group" "mk_aks_rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_kubernetes_cluster" "mk_aks" {
  name                = var.cluster_name
  location            = azurerm_resource_group.mk_aks_rg.location
  resource_group_name = azurerm_resource_group.mk_aks_rg.name
  dns_prefix          = var.dns_prefix

  default_node_pool {
    name       = "default"
    node_count = var.node_count
    vm_size    = var.vm_size
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
  }

  tags = {
    environment = "dev"
    project     = "mk-devops"
  }
}