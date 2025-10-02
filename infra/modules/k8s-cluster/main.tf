# EKS Cluster Configuration for AWS
resource "aws_eks_cluster" "main" {
  count = var.deployment_type == "aws" ? 1 : 0

  name     = var.cluster_name
  role_arn = aws_iam_role.cluster[0].arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
    security_group_ids      = [var.cluster_security_group_id]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  tags = merge(var.tags, {
    Name = var.cluster_name
  })

  depends_on = [
    aws_iam_role_policy_attachment.cluster_amazon_eks_cluster_policy[0],
    aws_iam_role_policy_attachment.cluster_amazon_eks_vpc_resource_controller[0],
    aws_cloudwatch_log_group.cluster[0]
  ]
}

# CloudWatch Log Group for EKS Cluster
resource "aws_cloudwatch_log_group" "cluster" {
  count = var.deployment_type == "aws" ? 1 : 0

  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 7

  tags = var.tags
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "cluster" {
  count = var.deployment_type == "aws" ? 1 : 0

  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })

  tags = var.tags
}

# IAM Role Policy Attachments for EKS Cluster
resource "aws_iam_role_policy_attachment" "cluster_amazon_eks_cluster_policy" {
  count = var.deployment_type == "aws" ? 1 : 0

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster[0].name
}

resource "aws_iam_role_policy_attachment" "cluster_amazon_eks_vpc_resource_controller" {
  count = var.deployment_type == "aws" ? 1 : 0

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.cluster[0].name
}

# EKS Node Group
resource "aws_eks_node_group" "main" {
  count = var.deployment_type == "aws" ? 1 : 0

  cluster_name    = aws_eks_cluster.main[0].name
  node_group_name = var.node_group_name
  node_role_arn   = aws_iam_role.worker_nodes[0].arn
  subnet_ids      = var.private_subnet_ids
  capacity_type   = var.node_capacity_type
  instance_types  = var.node_instance_types
  disk_size       = var.node_disk_size

  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }

  update_config {
    max_unavailable = 1
  }

  remote_access {
    source_security_group_ids = [var.worker_security_group_id]
  }

  tags = merge(var.tags, {
    Name = "${var.cluster_name}-node-group"
  })

  depends_on = [
    aws_iam_role_policy_attachment.worker_nodes_amazon_eks_worker_node_policy[0],
    aws_iam_role_policy_attachment.worker_nodes_amazon_eks_cni_policy[0],
    aws_iam_role_policy_attachment.worker_nodes_amazon_ec2_container_registry_read_only[0],
  ]
}

# IAM Role for EKS Worker Nodes
resource "aws_iam_role" "worker_nodes" {
  count = var.deployment_type == "aws" ? 1 : 0

  name = "${var.cluster_name}-worker-nodes-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
    Version = "2012-10-17"
  })

  tags = var.tags
}

# IAM Role Policy Attachments for Worker Nodes
resource "aws_iam_role_policy_attachment" "worker_nodes_amazon_eks_worker_node_policy" {
  count = var.deployment_type == "aws" ? 1 : 0

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.worker_nodes[0].name
}

resource "aws_iam_role_policy_attachment" "worker_nodes_amazon_eks_cni_policy" {
  count = var.deployment_type == "aws" ? 1 : 0

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.worker_nodes[0].name
}

resource "aws_iam_role_policy_attachment" "worker_nodes_amazon_ec2_container_registry_read_only" {
  count = var.deployment_type == "aws" ? 1 : 0

  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.worker_nodes[0].name
}

# EKS Addons
resource "aws_eks_addon" "cni" {
  count = var.deployment_type == "aws" ? 1 : 0

  cluster_name = aws_eks_cluster.main[0].name
  addon_name   = "vpc-cni"
}

resource "aws_eks_addon" "coredns" {
  count = var.deployment_type == "aws" ? 1 : 0

  cluster_name = aws_eks_cluster.main[0].name
  addon_name   = "coredns"

  depends_on = [aws_eks_node_group.main]
}

resource "aws_eks_addon" "kube_proxy" {
  count = var.deployment_type == "aws" ? 1 : 0

  cluster_name = aws_eks_cluster.main[0].name
  addon_name   = "kube-proxy"
}

# Local Kubernetes Cluster Configuration (Kind)
resource "null_resource" "kind_cluster" {
  count = var.deployment_type == "local" ? 1 : 0

  provisioner "local-exec" {
    command = <<-EOT
      # Check if kind cluster already exists
      if ! kind get clusters | grep -q "^${var.cluster_name}$"; then
        # Create kind cluster
        cat <<EOF | kind create cluster --name ${var.cluster_name} --config=-
apiVersion: kind.x-k8s.io/v1alpha4
kind: Cluster
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
- role: worker
EOF
      fi

      # Install nginx ingress controller
      kubectl apply --filename https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

      # Wait for ingress controller to be ready
      kubectl wait --namespace ingress-nginx \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=90s
    EOT
  }

  provisioner "local-exec" {
    when    = destroy
    command = "kind delete cluster --name ${var.cluster_name} || true"
  }

  triggers = {
    cluster_name = var.cluster_name
  }
}

# Kubernetes Provider Configuration
data "aws_eks_cluster_auth" "main" {
  count = var.deployment_type == "aws" ? 1 : 0
  name  = aws_eks_cluster.main[0].name
}

provider "kubernetes" {
  host                   = var.deployment_type == "aws" ? aws_eks_cluster.main[0].endpoint : null
  cluster_ca_certificate = var.deployment_type == "aws" ? base64decode(aws_eks_cluster.main[0].certificate_authority[0].data) : null
  token                  = var.deployment_type == "aws" ? data.aws_eks_cluster_auth.main[0].token : null
}

# Create workshop-app namespace
resource "kubernetes_namespace" "workshop_app" {
  metadata {
    name = "workshop-app"
    labels = {
      name        = "workshop-app"
      environment = var.environment
    }
  }

  depends_on = [
    aws_eks_cluster.main,
    aws_eks_node_group.main,
    null_resource.kind_cluster
  ]
}