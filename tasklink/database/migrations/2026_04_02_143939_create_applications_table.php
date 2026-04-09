<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            // TaskDetail.jsx apply modal fields
            $table->decimal('price', 10, 2);
            $table->string('delivery_time');    // e.g. "2 days"
            $table->text('message');

            // Status — applicationsSlice updateApplicationStatus
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');

            // Relations
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('worker_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();

            // A worker can only apply once per task
            $table->unique(['task_id', 'worker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};