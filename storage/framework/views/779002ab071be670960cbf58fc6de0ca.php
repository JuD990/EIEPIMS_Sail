<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap" rel="stylesheet">
  <?php echo app('Illuminate\Foundation\Vite')('resources/css/app.css'); ?>
  <title>EIEPIMS</title>
</head>
<body>
  <div id="root"></div>
  
  <!-- Include React Refresh and JS entry point -->
  <?php echo app('Illuminate\Foundation\Vite')('resources/js/app.jsx'); ?>


  <!-- Inline script for environment variables -->
  <script>
    window.env = {
      API_BASE_URL: '<?php echo e(env("API_BASE_URL")); ?>'
    };
  </script>
</body>
</html>
<?php /**PATH /home/jud/Dev/EIEPIMS/resources/views/welcome.blade.php ENDPATH**/ ?>