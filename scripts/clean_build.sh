#!/usr/bin/env bash
# ビルド成果物を消して再生成する（テスト用スクリプト）
set -e

BUILD_DIR=$1
echo "cleaning $BUILD_DIR"
rm -rf $BUILD_DIR/*

grep -q "name" package.json && echo "package.json found"

echo "done"
