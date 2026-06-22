<?php
// APIルーティング設定（認証制限付き）

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

// 【誰でもできる操作】ユーザー登録、ログイン、投稿一覧の閲覧
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/posts', [PostController::class, 'index']);

// 【ログインしていないとできない操作】
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']); // ログアウト
    Route::post('/posts', [PostController::class, 'store']);   // 新しい投稿
    Route::delete('/posts/{id}', [PostController::class, 'destroy']); // 投稿の削除
});