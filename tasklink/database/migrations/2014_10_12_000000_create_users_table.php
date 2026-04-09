<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Auth
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['client', 'worker', 'admin'])->default('client');

            // Profile — used by Register.jsx, EditProfile.jsx, Profile.jsx
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone')->nullable();
            $table->string('location')->nullable();

            // Worker-only — used by Profile.jsx (skills, completedTasks, rating)
            $table->json('skills')->nullable();          // array of strings
            $table->integer('completed_tasks')->default(0);
            $table->decimal('rating', 3, 2)->nullable(); // e.g. 4.85

            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};