<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lead_pocs', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id');
            $table->string('firstname', 50);
            $table->string('middlename', 50)->nullable();
            $table->string('lastname', 50);
            $table->string('password')->nullable();
            $table->string('email', 50)->unique();
            $table->string('department', 50);
            $table->string('program', 50)->nullable();
            $table->string('role')->default('Lead POC');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_pocs');
    }
};
