---
title: "E-commerce Customer Segmentation — Big Data & Machine Learning"
description: "A Big Data project using Apache Spark and PySpark to analyze e-commerce transactions, engineer RFM features, and segment customers through machine learning. It compares K-Means and Agglomerative Clustering using squared Euclidean silhouette scores and demonstrates transaction enrichment with Kafka and Spark Structured Streaming."
date: 2026-01-15
categories: [Projects]
tags: [spark, pyspark, kafka, big-data, machine-learning]
author: MOZA
tech: ["Python", "Apache Spark", "PySpark", "Spark MLlib", "Kafka", "Docker", "Jupyter"]
github: "https://github.com/moza369/ecommerce-customer-segmentation-big-data"
status: "Completed"
toc: true
---

## Overview

This project applies Big Data processing and machine learning to e-commerce transaction data. It builds customer-level features with RFM analysis, compares clustering approaches, and demonstrates how incoming transactions can be associated with previously computed customer segments.

The implementation uses Apache Spark and PySpark for distributed processing, Spark MLlib for K-Means clustering, and Kafka with Spark Structured Streaming for transaction enrichment.

## Workflow

The project follows an end-to-end customer segmentation workflow:

1. Load and explore the Online Retail dataset.
2. Clean the transaction data by removing duplicates, missing customer IDs, cancellations, and non-positive quantities or prices.
3. Calculate transaction revenue and aggregate customer-level Recency, Frequency, and Monetary (RFM) features.
4. Apply log transformations, assemble the feature vector, and standardize the RFM data.
5. Evaluate K-Means clustering for values of K from 2 through 8.
6. Compare K-Means with Agglomerative Clustering using silhouette scores on the same standardized features.
7. Save the selected customer segmentation as Parquet for downstream use.
8. Consume JSON transactions from Kafka and associate recognized customers with their saved segment using Spark Structured Streaming.

The streaming pipeline enriches transactions with the existing segmentation; it does not retrain the clustering model.

## Model comparison

K-Means and Agglomerative Clustering (Ward linkage) were compared using two clusters and the same standardized RFM features, with the silhouette score calculated using squared Euclidean distance (`sqeuclidean`).

| Algorithm | Clusters | Silhouette score |
|---|---:|---:|
| K-Means | 2 | **0.6238** |
| Agglomerative Clustering (Ward) | 2 | 0.5567 |

K-Means achieved the higher silhouette score and was selected for the final customer segmentation.

The Spark MLlib model-selection step also evaluated K-Means for K values from 2 to 8. K = 2 achieved the highest silhouette score among the tested values, at 0.6238.

Both evaluation steps use squared Euclidean distance. The K-Means model-selection score is calculated with Spark MLlib, while the algorithm-comparison scores are calculated with scikit-learn.

## Customer profiles

The selected segmentation produces two descriptive customer profiles:

| Cluster | Customers | Share | Average recency (days) | Average frequency (invoices) | Average monetary value |
|---|---:|---:|---:|---:|---:|
| 0 | 1,654 | 38.13% | 25.39 | 8.49 | 4,566.18 |
| 1 | 2,684 | 61.87% | 133.15 | 1.68 | 497.30 |

Cluster 0 represents customers with more recent purchases and higher average purchase frequency and monetary value. Cluster 1 represents customers with less recent purchases and lower average frequency and monetary value.

## Batch and stream processing

### Batch processing

The batch pipeline uses Spark DataFrames and RFM feature engineering to create the customer representation, train and compare clustering models, inspect customer profiles, and save the selected segmentation to Parquet.

### Stream processing

Kafka receives JSON transaction events on the `customer-transactions` topic. Spark Structured Streaming reads these events and joins recognized customers with the saved segmentation so each transaction can be associated with its existing cluster. Unknown customers may have no assigned cluster.

## Infrastructure

The project runs with Docker Compose and Jupyter:

- **Docker Compose** provides the project services.
- **Jupyter** provides the notebook-based development environment.
- **Apache Spark** handles distributed batch processing and Structured Streaming.
- **Apache Kafka** provides the transaction event stream.

## Dataset

The project uses the [Online Retail dataset from the UCI Machine Learning Repository](https://archive.ics.uci.edu/dataset/352/online%2Bretail).

The original dataset contains 541,909 rows. After cleaning, the project reports approximately 392,692 valid transactions, 4,338 customers, 18,532 invoices, and 3,665 products.

## Technology Stack

- Python
- Apache Spark
- PySpark
- Spark SQL
- Spark MLlib
- Apache Kafka
- Spark Structured Streaming
- K-Means and Agglomerative Clustering
- RFM analysis
- Docker Compose
- Jupyter
