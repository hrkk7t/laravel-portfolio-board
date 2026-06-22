# backend/Dockerfile

FROM php:8.4-cli

# 必要なツールとSQLite用拡張のインストール
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libsqlite3-dev \
    && docker-php-ext-install pdo_sqlite

# Composerの導入
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# ファイルのコピー
COPY . .

# 依存関係のインストール
RUN composer install --no-dev --optimize-autoloader

# データベースファイルの準備と権限設定
RUN touch database/database.sqlite \
    && chmod -R 777 database storage

EXPOSE 8000

# 起動時にマイグレーションを実行し、サーバーを立ち上げる
CMD php artisan migrate --force && php artisan serve --host 0.0.0.0 --port 8000