<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            // Basic info — CreateTask.jsx
            $table->string('title');
            $table->text('description');
            $table->enum('category', [
                'Plumbing', 'Electrical', 'Carpentry', 'Painting',
                'Cleaning', 'Moving Help', 'Gardening', 'Assembly', 'Other',
            ]);
            $table->enum('urgency', ['low', 'medium', 'high'])->default('medium');
            $table->decimal('budget', 10, 2);
            $table->string('location');

            // Status — tasksSlice.js filters + TaskDetail.jsx badge
            $table->enum('status', ['published', 'assigned', 'in_progress', 'completed'])
                  ->default('published');

            // Skills — CreateTask.jsx / TaskDetail.jsx
            $table->json('required_skills')->nullable(); // array of strings

            // Map — CreateTask.jsx sends coordinates
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Relations
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('worker_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};