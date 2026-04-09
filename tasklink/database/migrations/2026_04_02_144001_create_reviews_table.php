<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            // reviewsSlice: rating, comment; Profile.jsx shows reviewerId, revieweeId
            $table->unsignedTinyInteger('rating');      // 1–5
            $table->text('comment')->nullable();

            // Relations
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewee_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();

            // One review per reviewer per task
            $table->unique(['task_id', 'reviewer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};